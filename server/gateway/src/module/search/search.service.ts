// https://www.npmjs.com/package/@elastic/elasticsearch
//공식문서 참고

//7.13.0버전 코드임, aws 버전과 맞추기 위해 내렸음
import { Client } from '@elastic/elasticsearch';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PostDto } from '../post/dto/post.dto';
import {
  SearchedHashtag,
  SearchedUser,
  SearchResult,
  SnsPostsDocType,
} from './types/search.types';
import {
  awsElasticSearch,
  localElasticSearch,
} from 'src/configs/elascit.config';

const NODE_ENV = process.env.NODE_ENV;

@Injectable()
export class SearchService implements OnModuleInit {
  private logger = new Logger(SearchService.name);
  private readonly elasticClient: Client;
  private readonly SnsPostsIndex = 'sns.posts';
  private readonly SnsTagsIndex = 'sns.tags';
  private readonly SnsUsersIndex = 'sns.users';

  constructor() {
    this.elasticClient = new Client(
      NODE_ENV ? localElasticSearch : awsElasticSearch,
    );
  }

  onModuleInit() {
    this.init();
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

    //검색기능에 올리는건 후순위 작업이니 await 안함
    return this.elasticClient
      .index({
        index: this.SnsPostsIndex,
        id: postDto.postId,
        body: postDoc,
      })
      .then(() => {
        //삽입 후 tags가 있다면, 순회하면서 엘라스틱에서 존재하는 태그인지 체크
        if (postDoc.tags !== undefined) {
          postDoc.tags.split(' ').forEach((tag) => {
            this.checkTagExisted(tag);
          });
        }
      });
  }

  /**태그가 존재하는지 체크해서 있으면 카운터증가, 없으면 DOC삽입 */
  checkTagExisted(tag: string) {
    this.elasticClient
      .get({
        index: this.SnsTagsIndex,
        id: tag,
      })
      .then((res) => {
        //2-1. 존재하는 태그면 count 증가
        this.elasticClient.update({
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
        this.elasticClient.index({
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

  async searchHashtag(data: {
    hashtag: string;
  }): Promise<{ tagName: string; count: number }[]> {
    const result = await this.elasticClient.search({
      index: this.SnsTagsIndex,
      body: {
        query: {
          prefix: {
            tagName: data.hashtag,
          },
        },
      },
    });

    const tagList = result.body.hits.hits.map((item) => {
      return item._source;
    }) as { tagName: string; count: number }[];

    return tagList;
  }

  async getPostsIdsByHashtag(data) {
    const pageSize = 12; // 페이지당 수

    let tagInfo;
    if (data.page === 0) {
      try {
        const res = await this.elasticClient.get({
          index: this.SnsTagsIndex,
          id: data.hashtag,
        });
        tagInfo = res.body._source;
      } catch (error) {
        // 찾기실패
        tagInfo = undefined;
      }
    } else {
      // 첫번째 요청인지 페이지 보고 알아낸 후, 두번째 요청부터는 검색안함
      tagInfo = { tagName: data.hashtag, count: 0 };
    }

    if (tagInfo === undefined) {
      return { searchSuccess: false, _ids: [], count: 0 };
    }

    const result = await this.elasticClient.search({
      index: this.SnsPostsIndex,
      body: {
        from: data.page * pageSize, // 시작 인덱스 계산
        size: pageSize,
        query: {
          match: {
            tags: data.hashtag,
          },
        },
      },
    });

    const postIdList = result.body.hits.hits.map((item) => {
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
  }) {
    const pageSize = 12; // 페이지당 수

    const result = await this.elasticClient.search({
      index: this.SnsPostsIndex,
      body: {
        from: data.page * pageSize, // 시작 인덱스 계산
        size: pageSize,
        query: {
          //prefix로 할지 match로 할지 고민된다. 일단 prefix로 해놨음
          prefix: {
            title: data.searchString,
          },
        },
        // sort: [
        //   {
        //     createdAt: {
        //       order: 'asc', // 내림차순으로 정렬 (가장 최근 것이 먼저)
        //     },
        //   },
        // ],
      },
    });

    const postIdList: string[] = result.body.hits.hits.map((item) => {
      return item._id;
    });

    return { _ids: postIdList };
  }

  async searchHashtagsBySearchString(data: {
    searchString: string;
    page: number;
  }) {
    const pageSize = 20;
    const result = await this.elasticClient.search({
      index: this.SnsTagsIndex,
      body: {
        from: data.page * pageSize, // 시작 인덱스 계산
        size: pageSize,
        query: {
          prefix: {
            tagName: data.searchString,
          },
        },
        // sort: [
        //   {
        //     createdAt: {
        //       order: 'asc', // 내림차순으로 정렬 (가장 최근 것이 먼저)
        //     },
        //   },
        // ],
      },
    });

    const searchedTagList = result.body.hits.hits.map((item) => {
      return item._source;
    }) as { tagName: string; count: number }[];

    return { searchedTags: searchedTagList };
  }

  async deletePost(data) {
    try {
      const { body: targetDoc } = await this.elasticClient.get({
        index: this.SnsPostsIndex,
        id: data.postId,
      });

      const tags = targetDoc._source.tags;
      // 1. 검색용 데이터를 postIndex에서 삭제
      await this.elasticClient.delete({
        index: this.SnsPostsIndex,
        id: data.postId,
      });

      // 2. 검색용 데이터에 tag가 있다면 해당 tag의 카운터 decre
      if (tags !== undefined) {
        const tagList = tags.split(' ');
        for (const item of tagList) {
          await this.elasticClient.updateByQuery({
            index: this.SnsTagsIndex,
            body: {
              script: {
                source: 'ctx._source.count--',
                lang: 'painless',
              },
              query: {
                term: {
                  tagName: item,
                },
              },
            },
          });
        }
      }
    } catch (error) {
      this.logger.error(
        'elastic에서 post정보 삭제중 에러, 아마 정보가 없을거임',
      );
      this.logger.error(error);
    }
  }

  async init() {
    // 이미 있는지 체크
    const indexExistCheck1 = await this.elasticClient.indices.exists({
      index: this.SnsPostsIndex,
    });
    const indexExistCheck2 = await this.elasticClient.indices.exists({
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
      await this.elasticClient.indices.create({
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
      await this.elasticClient.indices.create({
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

  async searchUsersBySearchString(data: {
    searchString: string;
    page: number;
  }) {
    const pageSize = 20; // 페이지당 수

    const string = data.searchString + '*';

    //와일드카드(프리픽스랑 비슷한듯)로 검색을 여러필드에서 수행함
    const result = await this.elasticClient.search({
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

    const userInfoList = result.body.hits.hits.map((item) => {
      return item._source;
    }) as {
      username: string;
      introduce: string;
      img: string;
      introduceName: string;
    }[];

    return { userList: userInfoList };
  }

  async searchUserOrHashtag(string: string): Promise<SearchResult> {
    const pageSize = 7;

    const type = string.at(0);
    const searchString = string.substring(1);

    //#시작하면 태그검색, @시작하면 유저검색임
    const result = await this.elasticClient.search({
      index: type === '#' ? this.SnsTagsIndex : this.SnsUsersIndex,
      body: {
        size: pageSize,
        query: {
          prefix:
            type === '#'
              ? {
                  tagName: searchString,
                }
              : {
                  username: searchString,
                },
        },
      },
    });

    const resultList = result.body.hits.hits.map((item) => {
      return item._source;
    }) as SearchedUser[] | SearchedHashtag[];

    return { resultList, type: type === '#' ? 'hashtag' : 'user' };
  }
}

//여기 아래부터는 elastic 기본 사용법 코드들, 나중에 보려고 빼놓았음

// import { Injectable, Catch } from '@nestjs/common';
// import { PostDto } from './dto/post.dto';
// import { elastic } from 'src/configs/elasticsearch';

// //해시태그 처리 서비스
// @Injectable()
// export class HashtagService {
//   constructor() {
//     const examplePostDto = new PostDto();
//     examplePostDto.postId = '1';
//     examplePostDto.title = '안녕하세요 #1번태그 #2번태그 녹두로 #333 #강호3';
//     examplePostDto.userId = '34';
//     //this.handleHashtag(examplePostDto);

//     // this.elasticClient.index({
//     //   index: elastic.SnsTagsIndex,
//     // id: '강호5',
//     //   document: {
//     //     tagName: '강호 에는 많은 사람이 있어요',
//     //     count: 1,
//     //   },
//     // });

//     // this.elasticClient
//     //   .get({ index: elastic.SnsTagsIndex, id: '강호3' })
//     //   .then((res) => {
//     //     console.log(res.found);
//     //     console.log(res);
//     //   })
//     //   .catch((err) => {
//     //     console.log(err.body.found);
//     //   });
//     //공식문서와 테스트 결과,
//     //https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html
//     //프리픽스는 '가나'로 시작하는거 찾는거임 -> 태그 자체를 검색하기 위해 쓰자.
//     //매치는 '가 나다라 마바 사아자차카' 에서 마바 또는 가 만으로 검색해도 나오는것
//     //->> 태그가 포함된 게시물을 찾을 때 쓰자.
//     //태그의 _id는 태그네임 그 자체로 써서 중복방지하고, 찾을 때 빨리 찾을수도 있음.
//     //_id로 태그검색해서 err뜨면 DOC삽입, then으로 넘어가면 카운트 증가
//     // this.elasticClient
//     //   .search({
//     //     query: {
//     //       match: {
//     //         tagName: '많은',
//     //       },
//     //     },
//     //   })
//     //   .then((res) => {
//     //     console.log(res.hits.hits);
//     //   });
//   }

//   //업로드 메서드로부터 오는 해시태그 핸들링 요청
//   //해시태그 존재여부 체크후 없으면 추가,
//   //해시태그가 사용된 횟수 카운트? 필요할까 업데이트가 꽤 많을듯
//   //해시태그 추출, postId와 해시태그 나열해서 엘라스틱에 저장
//   async handleHashtag(postDto: PostDto) {
//     //title로부터 해시태그 추출
//     const tmp = postDto.title.match(/#\S+/g);
//     if (tmp === null) {
//       return;
//     }

//     const tags = tmp.map((item) => {
//       return item.substring(1);
//     });

//     const tagString = tags.join(' ');
//     console.log(tagString);
//     console.log(tags);

//     //tags 순회하면서 엘라스틱에서 존재하는 태그인지 체크
//     //카운트는 후순위 작업이니 await 안함
//     tags.forEach((tag) => {
//       this.checkTagExisted(tag);
//     });

//     //3. post DOC 삽입. 태그일치 검색을 위한 tag문자열, 전문검색을 위한 title 전문

//     return;
//   }

//   /**태그가 존재하는지 체크해서 있으면 카운터증가, 없으면 DOC삽입 */
//   checkTagExisted(tag: string) {
//     this.elasticClient
//       .get({
//         index: elastic.SnsTagsIndex,
//         id: tag,
//       })
//       .then((res) => {
//         console.log(`${tag} is exist, count ++`);
//         //2-1. 존재하는 태그면 count 증가
//         this.elasticClient.update({
//           index: elastic.SnsTagsIndex,
//           id: tag,
//           script: {
//             //https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/update_examples.html
//             //integer값을 증가시키는법
//             lang: 'painless',
//             source: 'ctx._source.count++',
//           },
//         });
//         return res.found; //여기서는 true 리턴
//       })
//       .catch((err) => {
//         console.log(`${tag} is missing, create DOC`);

//         //2-2. 존재하지 않으면 새로운 DOC 추가, missing하면 err뱉어내서 여기로 옴
//         this.elasticClient.index({
//           index: elastic.SnsTagsIndex,
//           id: tag,
//           document: {
//             tagName: tag,
//             count: 1,
//           },
//         });
//         return err.body.found; //못찾아서 에러뜨면 여기로 오고, false 리턴임
//       });
//   }
// }
