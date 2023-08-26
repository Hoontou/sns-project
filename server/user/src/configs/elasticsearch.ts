import { Client } from '@elastic/elasticsearch';

export interface SnsUsersDocType {
  username: string;
  introduce: string;
  userId: number;
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
    const indexExistCheck: boolean = await this.client.indices.exists({
      index: this.SnsUsersIndex,
    });

    if (indexExistCheck === true) {
      return;
    }

    try {
      await this.client.indices.create({
        index: this.SnsUsersIndex,
        body: {
          mappings: {
            properties: {
              username: { type: 'text' },
              introduce: { type: 'text' },
              userId: { type: 'integer' },
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
