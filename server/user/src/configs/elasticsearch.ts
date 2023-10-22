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

class Elasticsearch {
  public readonly client;
  public readonly SnsUsersIndex = 'sns_users';

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
    const indexExistCheck: boolean = await this.client.indices.exists({
      index: this.SnsUsersIndex,
    });

    if (indexExistCheck === true) {
      return;
    }

    //인덱스 생성
    try {
      await this.client.indices.create({
        index: this.SnsUsersIndex,
        body: {
          mappings: {
            properties: {
              username: { type: 'text' },
              introduce: { type: 'text' },
              img: { type: 'text' },
              introduceName: { type: 'text' },
            },
          },
        },
      });

      console.log(`Index created:${this.SnsUsersIndex}`);
    } catch (error) {
      console.log(`Error creating index:${this.SnsUsersIndex}`);
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
