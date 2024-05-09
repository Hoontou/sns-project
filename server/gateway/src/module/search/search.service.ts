import { Injectable, Logger } from '@nestjs/common';
import { PostDto } from '../post/dto/post.dto';
import {
  SearchedHashtag,
  SearchedUser,
  SearchResult,
  SnsPostsDocType,
  SnsUsersDocType,
  SnsUsersUpdateForm,
} from './types/search.types';
import { ElasticIndex } from './elastic.index';
import { HashtagCollection } from './repository/hashtag.collection';
import { HashtagDocType } from './repository/hashtag.schema';

@Injectable()
export class SearchService {
  private logger = new Logger(SearchService.name);

  constructor(
    private elasticIndex: ElasticIndex,
    private hashtagCollection: HashtagCollection,
  ) {}

  /**색인, 검색을 위해 username, introName은 소문자로 파싱 */
  insertUser(user_id: string, userDoc: SnsUsersDocType) {
    const lowerForm: SnsUsersDocType = {
      ...userDoc,
      username: userDoc.username.toLowerCase(),
      introduceName: userDoc.introduceName.toLowerCase(),
    };
    return this.elasticIndex.insertUserDoc(user_id, lowerForm);
  }

  /**색인, 검색을 위해 username, introName은 소문자로 파싱 */
  updateUser(user_id: string, form: SnsUsersUpdateForm) {
    return this.elasticIndex.updateUserDoc(
      user_id,
      this.parseToLowerFormForUpdateUser(form),
    );
  }

  async indexTitleAndHashtags(postDto: PostDto) {
    const parsedHashtags = postDto.title.match(/#\S+/g)?.map((item) => {
      return item.substring(1).toLowerCase();
    });

    //post DOC 삽입. 태그일치 검색을 위한 tag문자열, 전문검색을 위한 title 전문
    const postDoc: SnsPostsDocType = {
      //검색에 잘 잡히게 태그문자열 삭제
      title: postDto.title.replace(/[@#]/g, '').toLowerCase(),
      tags: parsedHashtags ? [...new Set(parsedHashtags)].join(' ') : undefined,
    };

    await this.elasticIndex.insertPostDoc(postDto.postId, postDoc);
    return;
  }

  //아.. 이거 진짜 개판인데 왜 이렇게 대충짜놨지
  //슥 보니까 프런트랑 개판으로 엮여있는거같은데..
  async getPostsIdsByHashtag(data: { hashtag: string; page: number }): Promise<{
    _ids: string[];
    count: number;
    searchSuccess: boolean;
  }> {
    const lowerTag = data.hashtag.toLowerCase();

    const hashtagDoc: HashtagDocType =
      data.page === 0
        ? await this.hashtagCollection.getTagDocByTagName(lowerTag)
        : { tagName: data.hashtag, count: 0 };

    if (hashtagDoc === undefined) {
      return { searchSuccess: false, _ids: [], count: 0 };
    }

    const getResult = await this.elasticIndex.getPostsByMatchHashtag(
      data.page,
      lowerTag,
    );

    return {
      _ids: getResult.post_ids,
      count: hashtagDoc.count,
      searchSuccess: true,
    };
  }

  async searchPostsBySearchString(data: {
    searchString: string;
    page: number;
  }): Promise<{
    _ids: string[];
  }> {
    const searchResult = await this.elasticIndex.searchPostsByTitle(
      data.page,
      data.searchString.toLowerCase(),
    );

    return { _ids: searchResult.post_ids };
  }

  async searchHashtagsBySearchString(data: {
    searchString: string;
    page: number;
  }): Promise<{
    searchedTags: {
      tagName: string;
      count: number;
    }[];
  }> {
    const pageSize = 20;

    const { searchedTags } = await this.elasticIndex.searchTags(
      data.page,
      pageSize,
      data.searchString.toLowerCase(),
    );

    if (searchedTags === undefined) {
      return { searchedTags: [] };
    }

    const tagsFetchedCount: SearchedHashtag[] = await Promise.all(
      searchedTags.map(async (i) => {
        const count = await this.hashtagCollection.getTagCountBy_id(i.objId);
        return { tagName: i.tagName, count };
      }),
    );

    return { searchedTags: tagsFetchedCount };
  }

  async deletePost(data) {
    try {
      const { body: targetDoc } = await this.elasticIndex.client.get({
        index: this.elasticIndex.SnsPostsIndex,
        id: data.postId,
      });

      const tags = targetDoc._source.tags;
      // 1. 검색용 데이터를 postIndex에서 삭제
      await this.elasticIndex.client.delete({
        index: this.elasticIndex.SnsPostsIndex,
        id: data.postId,
      });

      // 2. 검색용 데이터에 tag가 있다면 해당 tag의 카운터 decre
      if (tags !== undefined) {
        const tagList = tags.split(' ');
        for (const item of tagList) {
          await this.elasticIndex.decrementPostCountOfHashtag(item);
        }
      }

      return;
    } catch (error) {
      this.logger.error(
        'elastic에서 post정보 삭제중 에러, 아마 정보가 없을거임',
      );
      this.logger.error(error);
    }
  }

  async searchUsersBySearchString(data: {
    searchString: string;
    page: number;
  }): Promise<{
    userList: {
      username: string;
      introduce: string;
      img: string;
      introduceName: string;
    }[];
  }> {
    const { searchedUserList }: { searchedUserList: SnsUsersDocType[] } =
      await this.elasticIndex.searchUserByString(
        data.page,
        data.searchString.toLowerCase(),
      );

    if (searchedUserList.length === 0) {
      return { userList: [] };
    }

    return {
      userList: searchedUserList,
    };
  }

  async searchUserOrHashtag(string: string): Promise<SearchResult> {
    const { type, searchString } = this.parseSearchString(string);

    const result =
      type === '#'
        ? await this.searchHashtag(searchString)
        : await this.searchUser(searchString);

    return { resultList: result, type: type === '#' ? 'hashtag' : 'user' };
  }

  private parseSearchString(string: string): {
    searchString: string;
    type: '#' | '@';
  } {
    const type = string.at(0) === '#' ? '#' : '@';

    if (type === '#') {
      return { searchString: string.substring(1).toLowerCase(), type };
    }

    return {
      searchString: (type === '@' ? string.substring(1) : string).toLowerCase(),
      type,
    };
  }

  private async searchHashtag(string: string): Promise<SearchedHashtag[]> {
    const pageSize = 20;

    const { searchedTags } = await this.elasticIndex.searchTags(
      0,
      pageSize,
      string,
    );

    const tagsFetchedCount: SearchedHashtag[] = await Promise.all(
      searchedTags.map(async (i) => {
        const count = await this.hashtagCollection.getTagCountBy_id(i.objId);
        return { tagName: i.tagName, count };
      }),
    );

    return tagsFetchedCount;
  }

  private async searchUser(string: string): Promise<SearchedUser[]> {
    const result = await this.elasticIndex.searchUserByString(0, string);

    return result.searchedUserList;
  }

  private parseToLowerFormForUpdateUser(
    form: SnsUsersUpdateForm,
  ): SnsUsersUpdateForm {
    const tmpUsernameObj = form.username
      ? { username: form.username.toLowerCase() }
      : {};

    const tmpIntroNameObj = form.introduceName
      ? { introduceName: form.introduceName.toLocaleLowerCase() }
      : {};

    return {
      ...form,
      ...tmpIntroNameObj,
      ...tmpUsernameObj,
    };
  }
}
