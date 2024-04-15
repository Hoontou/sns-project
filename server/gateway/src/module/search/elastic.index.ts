// https://www.npmjs.com/package/@elastic/elasticsearch
//공식문서 참고

//7.13.0버전 코드임, aws 버전과 맞추기 위해 내렸음

import { Client } from '@elastic/elasticsearch';
import { Injectable, Logger } from '@nestjs/common';
import {
  localElasticSearch,
  awsElasticSearch,
} from '../../configs/elascit.config';
import { SnsPostsDocType } from './types/search.types';

const NODE_ENV = process.env.NODE_ENV;

@Injectable()
export class ElasticIndex {
  private logger = new Logger(ElasticIndex.name);
  public readonly client: Client;
  public readonly SnsPostsIndex = 'sns.posts';
  public readonly SnsTagsIndex = 'sns.tags';
  public readonly SnsUsersIndex = 'sns.users';

  constructor() {
    this.client = new Client(NODE_ENV ? localElasticSearch : awsElasticSearch);
  }

  onModuleInit() {
    this.init();
  }

  insertPostDoc(postId, postDoc: SnsPostsDocType) {
    return this.client
      .index({
        index: this.SnsPostsIndex,
        id: postId,
        body: postDoc,
      })
      .then(() => {
        //삽입 후 tags가 있다면, 순회하면서 엘라스틱에서 존재하는 태그인지 체크
        if (postDoc.tags !== undefined) {
          postDoc.tags.split(' ').forEach((tag) => {
            this.insertTagDocIfNotExist(tag);
          });
        }
      });
  }

  /**태그가 존재하는지 체크해서 있으면 카운터증가, 없으면 DOC삽입 */
  insertTagDocIfNotExist(tag: string) {
    this.client
      .get({
        index: this.SnsTagsIndex,
        id: tag,
      })
      .then((res) => {
        //2-1. 존재하는 태그면 count 증가
        this.client.update({
          index: this.SnsTagsIndex,
          id: tag,
          body: {
            script: {
              //https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/update_examples.html
              //integer값을 증가시키는법
              lang: 'painless',
              source: 'ctx._source.count++',
            },
          },
        });
        return res.body.found; //여기서는 true 리턴
      })
      .catch((err) => {
        this.logger.error(`${tag} tag is missing, create tag DOC`);

        //2-2. 존재하지 않으면 새로운 DOC 추가, missing하면 err뱉어내서 여기로 옴
        this.client.index({
          index: this.SnsTagsIndex,
          id: tag,
          body: {
            tagName: tag,
            count: 1,
          },
        });
        return err.body.found; //못찾아서 에러뜨면 여기로 오고, false 리턴임
      });
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

  getPostsByHashtag(page: number, hashtag: string) {
    const pageSize = 12; // 페이지당 수

    return this.client.search({
      index: this.SnsPostsIndex,
      body: {
        from: page * pageSize, // 시작 인덱스 계산
        size: pageSize,
        query: {
          match: {
            tags: hashtag,
          },
        },
      },
    });
  }

  searchPostsByTitle(page: number, searchString: string) {
    const pageSize = 12; // 페이지당 수

    return this.client.search({
      index: this.SnsPostsIndex,
      body: {
        from: page * pageSize, // 시작 인덱스 계산
        size: pageSize,
        query: {
          prefix: {
            title: searchString,
          },
        },
      },
    });
  }

  searchTags(page: number, size: number, searchString: string) {
    return this.client.search({
      index: this.SnsTagsIndex,
      body: {
        from: page * size, // 시작 인덱스 계산
        size: size,
        query: {
          prefix: {
            tagName: searchString,
          },
        },
      },
    });
  }

  decrementPostCountOfHashtag(tag: string) {
    return this.client.updateByQuery({
      index: this.SnsTagsIndex,
      body: {
        script: {
          source: 'ctx._source.count--',
          lang: 'painless',
        },
        query: {
          term: {
            tagName: tag,
          },
        },
      },
    });
  }

  async searchUserByString(
    page,
    searchString,
  ): Promise<
    {
      userId: number;
      username: string;
      introduce: string;
      img: string;
      introduceName: string;
    }[]
  > {
    const pageSize = 20; // 페이지당 수

    const string = '*' + searchString + '*';

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
                wildcard: {
                  username: string,
                },
              },
              {
                wildcard: {
                  introduceName: string,
                },
              },
            ],
          },
        },
        sort: [{ _score: { order: 'desc' } }],
      },
    });

    const userList: {
      userId: number;
      username: string;
      introduce: string;
      img: string;
      introduceName: string;
    }[] = result.body.hits.hits.map((item) => {
      return item._source;
    });

    return userList;
  }

  searchUsername(size: number, searchString: string) {
    return this.client.search({
      index: this.SnsUsersIndex,
      body: {
        size: size,
        query: {
          prefix: {
            username: searchString,
          },
        },
      },
    });
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
              // postId: { type: 'text' },
              title: { type: 'text' },
              tags: { type: 'text' },
            },
          },
        },
      });
      await this.client.indices.create({
        index: this.SnsTagsIndex,
        body: {
          mappings: {
            properties: {
              tagName: { type: 'text' },
              count: { type: 'integer' },
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
}
