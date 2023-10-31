// https://www.npmjs.com/package/@elastic/elasticsearch
//공식문서 참고

import { Client } from '@elastic/elasticsearch';

class Elasticsearch {
  public readonly client;
  public readonly SnsPostsIndex = 'sns.users';
  public readonly SnsHashtagsIndex = 'sns.tags';
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
}

export const elastic = new Elasticsearch();
