// https://www.npmjs.com/package/@elastic/elasticsearch
//공식문서 참고

import { Client } from '@elastic/elasticsearch';

export interface SnsPostsDocType {
  title: string;
  tags?: string;
}
/**tag의 중복방지를 위해 _id==tagName으로 저장하고, 검색은 tagName, 태그DOC 가져오는건 _id로 수행 */
export interface SnsTagsDocType {
  tagName: string;
  count: number;
}

class Elasticsearch {
  public readonly client;
  public readonly SnsPostsIndex = 'sns_posts';
  public readonly SnsTagsIndex = 'sns_tags';

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

    //인덱스 생성
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
}

export const elastic = new Elasticsearch();
