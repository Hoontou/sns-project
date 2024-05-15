// https://www.npmjs.com/package/@elastic/elasticsearch
//공식문서 참고

//7.13.0버전 코드임, aws 버전과 맞추기 위해 내렸음

import { Client } from '@elastic/elasticsearch';
import { Injectable, Logger } from '@nestjs/common';
import {
  localElasticSearch,
  awsElasticSearch,
} from '../../configs/elascit.config';
import {
  PostIndexSearchResult,
  SnsPostsDocType,
  SnsTagsDocType,
  SnsUsersDocType,
  SnsUsersUpdateForm,
  UserIndexSearchResult,
} from './types/search.types';
import { HashtagCollection } from './repository/hashtag.collection';

const NODE_ENV = process.env.NODE_ENV;

@Injectable()
export class ElasticIndex {
  private logger = new Logger(ElasticIndex.name);
  public readonly client: Client;
  public readonly SnsPostsIndex = 'sns.posts';
  public readonly SnsTagsIndex = 'sns.tags';
  public readonly SnsUsersIndex = 'sns.users';

  constructor(private hashtagCollection: HashtagCollection) {
    this.client = new Client(NODE_ENV ? localElasticSearch : awsElasticSearch);
  }

  onModuleInit() {
    this.init();
  }

  async insertUserDoc(user_id, userDoc: SnsUsersDocType) {
    await this.client.index({
      index: this.SnsUsersIndex,
      id: user_id,
      body: userDoc,
    });
    return;
  }

  async updateUserDoc(user_id: string, userDocUpdateForm: SnsUsersUpdateForm) {
    try {
      await this.client.update({
        index: this.SnsUsersIndex,
        id: user_id,
        body: {
          doc: userDocUpdateForm,
        },
      });
    } catch (error) {
      this.logger.error('Error updating document field:', {
        _id: user_id,
        ...userDocUpdateForm,
      });
      console.trace();
      this.logger.error(error);
    }
  }

  async insertPostDoc(postId, postDoc: SnsPostsDocType) {
    await this.client.index({
      index: this.SnsPostsIndex,
      id: postId,
      body: postDoc,
    });

    if (!postDoc.tags) {
      return;
    }

    //삽입 후 tags가 있다면, 처리요청
    for (const tag of postDoc.tags.split(' ')) {
      if (this.hasSpecialCharacters(tag)) {
        //특수문자 포함돼 있다면 처리안함.
        this.logger.debug('tag에 특수문자 있음, 저장안함');
        continue;
      }

      await this.insertTagDocIfNotExist(tag);
    }
  }

  /**태그가 존재하는지 체크해서 있으면 카운터증가, 없으면 DOC삽입 */
  async insertTagDocIfNotExist(tag: string) {
    const resultTryingInc =
      await this.hashtagCollection.incrementTagCountByTagName(tag);

    if (resultTryingInc) {
      return true;
    }

    this.logger.error(`${tag} tag is missing, create tag DOC`);
    //2-2. 존재하지 않으면 새로운 DOC 추가, missing하면 err뱉어내서 여기로 옴

    //몽고랑 elastic에 저장

    //몽고에 삽입하고 받은 _id
    const objId = await this.hashtagCollection.insertTagReturning_id(tag);

    await this.client.index({
      index: this.SnsTagsIndex,
      id: tag,
      body: {
        tagName: tag,
        objId,
      },
    });

    return false;
  }

  getTagById(id: string) {
    return this.client
      .get({
        index: this.SnsTagsIndex,
        id,
      })
      .then((res) => {
        return res.body._source;
      })
      .catch(() => {
        return undefined;
      });
  }

  /** 일치하는 태그를 가지고 있는 게시물 검색, 최근삽입 순으로 가져옴*/
  async getPostsByMatchHashtag(page: number, hashtag: string) {
    const pageSize = 12; // 페이지당 수

    const result = await this.client.search({
      index: this.SnsPostsIndex,
      body: {
        from: page * pageSize, // 시작 인덱스 계산
        size: pageSize,
        query: {
          match: {
            tags: hashtag,
          },
        },
        sort: [
          {
            _doc: {
              order: 'desc',
            },
          },
        ],
      },
    });

    const post_ids: string[] = result.body.hits.hits.map(
      (item: PostIndexSearchResult) => {
        return item._id;
      },
    );

    return { post_ids };
  }

  /**게시글의 title에 string을 접두사로 하는 단어가 있으면 가져옴 */
  async searchPostsByTitle(
    page: number,
    searchString: string,
  ): Promise<{ post_ids: string[] }> {
    const pageSize = 12; // 페이지당 수

    const result = await this.client.search({
      index: this.SnsPostsIndex,
      body: {
        from: page * pageSize, // 시작 인덱스 계산
        size: pageSize,
        query: {
          match: {
            title: searchString,
          },
        },
        sort: [
          {
            _score: { order: 'desc' },
          },
        ],
      },
    });

    const post_ids: string[] = result.body.hits.hits.map(
      (item: PostIndexSearchResult) => {
        return item._id;
      },
    );

    return { post_ids };
  }

  /**prefix로 우선적으로 찾아보고, size가 남으면 와일드 카드로도 찾아봄*/
  async searchTags(page: number, size: number, searchString: string) {
    const result = await this.client.search({
      index: this.SnsTagsIndex,
      body: {
        from: page * size, // 시작 인덱스 계산
        size: size,
        query: {
          bool: {
            should: [
              {
                prefix: { tagName: searchString },
              },
              {
                wildcard: { tagName: '*' + searchString + '*' },
              },
            ],
          },
        },
      },
    });

    const searchedTags = result.body.hits.hits.map((item) => {
      return item._source;
    }) as SnsTagsDocType[];

    return { searchedTags };
  }

  async searchUserByString(
    page,
    searchString,
  ): Promise<{
    searchedUserList: {
      username: string;
      introduce: string;
      img: string;
      introduceName: string;
    }[];
  }> {
    const pageSize = 20; // 페이지당 수

    const wildString = '*' + searchString + '*';

    //와일드카드(프리픽스랑 비슷한듯)로 검색을 여러필드에서 수행함
    //이거 개느릴거같은데??
    const result = await this.client.search({
      index: this.SnsUsersIndex,
      body: {
        from: page * pageSize, // 시작 인덱스 계산
        size: pageSize,
        query: {
          bool: {
            should: [
              {
                prefix: { username: searchString },
              },
              {
                prefix: { introduceName: searchString },
              },
              {
                wildcard: {
                  introduceName: wildString,
                },
              },
            ],
          },
        },
      },
    });

    const userList: SnsUsersDocType[] = result.body.hits.hits.map(
      (item: UserIndexSearchResult) => {
        return item._source;
      },
    );

    return { searchedUserList: userList };
  }

  async init() {
    // 이미 있는지 체크
    const indexExistCheck1 = await this.client.indices.exists({
      index: this.SnsPostsIndex,
    });
    const indexExistCheck2 = await this.client.indices.exists({
      index: this.SnsTagsIndex,
    });

    if (indexExistCheck1.body === true && indexExistCheck2.body === true) {
      return;
    }

    // 인덱스 생성, user인덱스는 몽고 타입 그대로 엘라스틱에 넣어도 되서 필요없다.
    // user인덱스는 monstache가 해준다.
    // monstache가 엄청좋은데? 라고 생각했는데, 검색에 필요한 데이터를 따로
    // 가공해서 엘라스틱에 넣어야 하면 역시 업데이트쿼리를 내가 날려줘야하네..
    try {
      await this.client.indices.create({
        index: this.SnsPostsIndex,
        body: {
          mappings: {
            properties: {
              title: { type: 'text' }, //한국어 토크나이저 적용.
              tags: { type: 'text' }, //분석기 적용 안함.
            },
          },
        },
      });
      await this.client.indices.create({
        index: this.SnsTagsIndex,
        body: {
          mappings: {
            properties: {
              tagName: { type: 'keyword' },
              objId: { type: 'text', index: false },
            },
          },
        },
      });
      await this.client.indices.create({
        index: this.SnsUsersIndex,
        body: {
          mappings: {
            properties: {
              username: { type: 'keyword' },
              introduceName: { type: 'keyword' },
              img: { type: 'text', index: false },
              introduce: { type: 'text', index: false },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Error creating index: ${this.SnsPostsIndex}, ${this.SnsTagsIndex}`,
      );
      this.logger.error(error.meta.body.error);
    }
  }

  private hasSpecialCharacters(input: string): boolean {
    const specialCharactersRegex = /^[0-9a-zA-Z\u3131-\uD79D]+$/;

    return !specialCharactersRegex.test(input);
  }
}
