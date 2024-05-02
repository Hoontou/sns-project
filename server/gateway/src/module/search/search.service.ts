import { Injectable, Logger } from '@nestjs/common';
import { PostDto } from '../post/dto/post.dto';
import {
  SearchedHashtag,
  SearchedUser,
  SearchResult,
  SnsPostsDocType,
  SnsTagsDocType,
  SnsUsersDocType,
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

  insertUser(user_id: string, userDoc: SnsUsersDocType) {
    return this.elasticIndex.insertUserDoc(user_id, userDoc);
  }

  updateUser(user_id, form) {
    return this.elasticIndex.updateUserDoc(user_id, form);
  }

  //업로드 메서드로부터 오는 해시태그 핸들링 요청
  //해시태그 존재여부 체크후 없으면 추가,
  //해시태그가 사용된 횟수 카운트? 필요할까 업데이트가 꽤 많을듯
  //해시태그 추출, postId와 해시태그 나열해서 엘라스틱에 저장
  /**해시태그 엘라스틱에 등록, 유저태그 알림요청 alert에 전송 */
  async handlePostTag(postDto: PostDto) {
    //post DOC 삽입. 태그일치 검색을 위한 tag문자열, 전문검색을 위한 title 전문
    const postDoc: SnsPostsDocType = {
      title: postDto.title.replace(/[@#]/g, ''), //검색에 잘 잡히게 태그문자열 삭제
      createdAt: new Date(), //이거 굳이 필요한지 고민중임.
    };

    //title로부터 해시태그만을 추출
    const hashtags = postDto.title.match(/#\S+/g)?.map((item) => {
      return item.substring(1);
    });
    if (hashtags !== undefined) {
      //태그 존재하면 postDoc에 tags필드 추가
      const tmp = [...new Set(hashtags)];
      postDoc.tags = tmp.join(' ');
    }

    await this.elasticIndex.insertPostDoc(postDto.postId, postDoc);
    return;
  }

  //아.. 이거 진짜 개판인데 왜 이렇게 대충짜놨지
  async getPostsIdsByHashtag(data: { hashtag: string; page: number }): Promise<{
    _ids: string[];
    count: number;
    searchSuccess: boolean;
  }> {
    const tagInfo: HashtagDocType =
      data.page === 0
        ? await this.hashtagCollection.getTagDocByTagName(data.hashtag)
        : { tagName: data.hashtag, count: 0 };

    if (tagInfo === undefined) {
      return { searchSuccess: false, _ids: [], count: 0 };
    }

    const result = await this.elasticIndex.getPostsByHashtag(
      data.page,
      data.hashtag,
    );

    const postIdList: string[] = result.body.hits.hits.map((item) => {
      return item._id;
    });

    return {
      _ids: postIdList,
      count: tagInfo.count,
      searchSuccess: true,
    };
  }

  async searchPostIdsBySearchString(data: {
    searchString: string;
    page: number;
  }): Promise<{
    _ids: string[];
  }> {
    const result = await this.elasticIndex.searchPostsByTitle(
      data.page,
      data.searchString,
    );

    const postIdList: string[] = result.body.hits.hits.map((item) => {
      return item._id;
    });

    return { _ids: postIdList };
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

    const result = await this.elasticIndex.searchTags(
      data.page,
      pageSize,
      data.searchString,
    );

    const searchedTagList = result.body.hits.hits.map((item) => {
      return item._source;
    }) as SnsTagsDocType[];

    if (searchedTagList === undefined) {
      return { searchedTags: [] };
    }

    const tagsFetchedCount: SearchedHashtag[] = await Promise.all(
      searchedTagList.map(async (i) => {
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
    const userList = await this.elasticIndex.searchUserByString(
      data.page,
      data.searchString,
    );

    if (userList.length === 0) {
      return { userList: [] };
    }

    return {
      userList: userList.map((i) => {
        return { ...i, userId: undefined };
      }),
    };
  }

  async searchUserOrHashtag(string: string): Promise<SearchResult> {
    const type = string.at(0);
    const searchString = string.substring(1);

    const result =
      type === '#'
        ? await this.searchHashtag(searchString)
        : await this.searchUser(searchString);

    return { resultList: result, type: type === '#' ? 'hashtag' : 'user' };
  }

  private async searchHashtag(string: string): Promise<SearchedHashtag[]> {
    const pageSize = 10;

    const result = await this.elasticIndex.searchTags(0, pageSize, string);

    const resultList = result.body.hits.hits.map((item) => {
      return item._source;
    }) as SnsTagsDocType[];

    const tagsFetchedCount: SearchedHashtag[] = await Promise.all(
      resultList.map(async (i) => {
        const count = await this.hashtagCollection.getTagCountBy_id(i.objId);
        return { tagName: i.tagName, count };
      }),
    );

    return tagsFetchedCount;
  }

  private async searchUser(string: string): Promise<SearchedUser[]> {
    const pageSize = 10;

    const result = await this.elasticIndex.searchUsername(pageSize, string);

    const resultList = result.body.hits.hits.map((item) => {
      return item._source;
    }) as SearchedUser[];

    return resultList;
  }
}
