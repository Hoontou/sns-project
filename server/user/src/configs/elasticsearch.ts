// https://www.npmjs.com/package/@elastic/elasticsearch
//공식문서 참고

import { Client } from '@elastic/elasticsearch';

/**userId 프로퍼티가 굳이 필요한가 싶은데, 일단 넣어놨음. 지금 docId == userId 상태임. */
export interface SnsUsersDocType {
  username: string;
  introduce: string;
  img: string;
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
}

export const elastic = new Elasticsearch();
