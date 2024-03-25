// https://www.npmjs.com/package/@elastic/elasticsearch
//공식문서 참고

import { Client } from '@elastic/elasticsearch';

/**userId 프로퍼티가 굳이 필요한가 싶은데, 일단 넣어놨음. 지금 docId == userId 상태임. */
export interface SnsUsersDocType {
  username: string;
  introduce: string;
  img: string;
  introduceName: string;
}

export interface SnsPostsDocType {
  title: string;
  tags?: string;
  createdAt: Date;
}
/**tag의 중복방지를 위해 _id==tagName으로 저장하고, 검색은 tagName, 태그DOC 가져오는건 _id로 수행 */
export interface SnsTagsDocType {
  tagName: string;
  count: number;
}

class Elasticsearch {
  public readonly client;
  public readonly SnsPostsIndex = 'sns.posts';
  public readonly SnsTagsIndex = 'sns.tags';
  public readonly SnsUsersIndex = 'sns.users';

  constructor() {
    this.client = new Client({
      node: 'http://elasticsearch:9200',
      auth: {
        username: 'elastic',
        password: 'elastic',
      },
    });
  }

  async init() {
    //이미 있는지 체크
    const indexExistCheck1: boolean = await this.client.indices.exists({
      index: this.SnsPostsIndex,
    });
    const indexExistCheck2: boolean = await this.client.indices.exists({
      index: this.SnsTagsIndex,
    });

    if (indexExistCheck1 === true && indexExistCheck2 === true) {
      return;
    }

    //인덱스 생성, user인덱스는 몽고 타입 그대로 엘라스틱에 넣어도 되서 필요없다.
    //user인덱스는 monstache가 해준다.
    //monstache가 엄청좋은데? 라고 생각했는데, 검색에 필요한 데이터를 따로
    //가공해서 엘라스틱에 넣어야 하면 역시 업데이트쿼리를 내가 날려줘야하네..
    try {
      await this.client.indices.create({
        index: this.SnsPostsIndex,
        body: {
          mappings: {
            properties: {
              //postId: { type: 'text' },
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

      console.log(`Index created:${this.SnsPostsIndex}, ${this.SnsTagsIndex}`);
    } catch (error) {
      console.log(
        `Error creating index:${this.SnsPostsIndex} , ${this.SnsTagsIndex}`,
      );
      console.log(error);
    }
  }

  async searchUsersBySearchString(data: {
    searchString: string;
    page: number;
  }) {
    const pageSize = 20; // 페이지당 수

    const string = data.searchString + '*';

    //와일드카드(프리픽스랑 비슷한듯)로 검색을 여러필드에서 수행함
    const result = await elastic.client.search({
      index: this.SnsUsersIndex,
      body: {
        from: data.page * pageSize, // 시작 인덱스 계산
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
              {
                wildcard: {
                  introduce: string,
                },
              },
            ],
          },
        },
      },
    });

    const userInfoList: {
      username: string;
      introduce: string;
      img: string;
      introduceName: string;
    }[] = result.hits.hits.map((item) => {
      return item._source;
    });

    return { userList: userInfoList };
  }
}

export const elastic = new Elasticsearch();
