import { Injectable } from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import { SnsPostsDocType, elastic } from 'src/configs/elasticsearch';

//해시태그 처리 서비스
@Injectable()
export class SearchService {
  //업로드 메서드로부터 오는 해시태그 핸들링 요청
  //해시태그 존재여부 체크후 없으면 추가,
  //해시태그가 사용된 횟수 카운트? 필요할까 업데이트가 꽤 많을듯
  //해시태그 추출, postId와 해시태그 나열해서 엘라스틱에 저장
  async indexPostDoc(postDto: PostDto) {
    //post DOC 삽입. 태그일치 검색을 위한 tag문자열, 전문검색을 위한 title 전문
    const postDoc: SnsPostsDocType = {
      title: postDto.title.replace(/[@#]/g, ''), //검색에 잘 잡히게 태그문자열 삭제
      createdAt: new Date(), //이거 굳이 필요한지 고민중임.
    };

    //title로부터 해시태그만을 추출
    const tags = postDto.title.match(/#\S+/g)?.map((item) => {
      return item.substring(1);
    });
    if (tags !== undefined) {
      //태그 존재하면 postDoc에 tags필드 추가
      const tmp = [...new Set(tags)];
      postDoc.tags = tmp.join(' ');
    }

    //검색기능에 올리는건 후순위 작업이니 await 안함
    elastic.client
      .index({
        index: elastic.SnsPostsIndex,
        id: postDto.postId,
        document: postDoc,
      })
      .then(() => {
        //삽입 후 tags가 있다면, 순회하면서 엘라스틱에서 존재하는 태그인지 체크
        if (postDoc.tags !== undefined) {
          postDoc.tags.split(' ').forEach((tag) => {
            this.checkTagExisted(tag);
          });
        }
      });
    return;
  }

  /**태그가 존재하는지 체크해서 있으면 카운터증가, 없으면 DOC삽입 */
  checkTagExisted(tag: string) {
    elastic.client
      .get({
        index: elastic.SnsTagsIndex,
        id: tag,
      })
      .then((res) => {
        console.log(`${tag} tag is exist, count ++`);
        //2-1. 존재하는 태그면 count 증가
        elastic.client.update({
          index: elastic.SnsTagsIndex,
          id: tag,
          script: {
            //https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/update_examples.html
            //integer값을 증가시키는법
            lang: 'painless',
            source: 'ctx._source.count++',
          },
        });
        return res.found; //여기서는 true 리턴
      })
      .catch((err) => {
        console.log(`${tag} tag is missing, create tag DOC`);

        //2-2. 존재하지 않으면 새로운 DOC 추가, missing하면 err뱉어내서 여기로 옴
        elastic.client.index({
          index: elastic.SnsTagsIndex,
          id: tag,
          document: {
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
    const result = await elastic.client.search({
      index: elastic.SnsTagsIndex,
      body: {
        query: {
          prefix: {
            tagName: data.hashtag,
          },
        },
      },
    });

    const tagList = result.hits.hits.map((item) => {
      return item._source;
    });

    return tagList;
  }

  async getPostsIdsByHashtag(data: {
    hashtag: string;
    page: number;
  }): Promise<{ searchSuccess: boolean; _ids: string[]; count: number }> {
    const pageSize = 12; // 페이지당 수

    const tagInfo: { tagName: string; count: number } | undefined =
      data.page === 0
        ? await elastic.client
            .get({
              index: elastic.SnsTagsIndex,
              id: data.hashtag,
            })
            .then((res) => {
              return res._source;
            })
            .catch((err) => {
              //찾기실패
              return undefined;
            })
        : //첫번째 요청인지 페이지 보고 알아낸 후, 두번째 요청부터는 검색안함
          { tagName: data.hashtag, count: 0 };

    // const tagInfo =
    //   data.page === 0
    //     ? await this.searchHashtag({ hashtag: data.hashtag })
    //     : { tagName: data.hashtag, count: 0 };

    if (tagInfo === undefined) {
      return { searchSuccess: false, _ids: [], count: 0 };
    }
    const result = await elastic.client.search({
      index: elastic.SnsPostsIndex,
      body: {
        from: data.page * pageSize, // 시작 인덱스 계산
        size: pageSize,
        query: {
          match: {
            tags: data.hashtag,
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
    console.log(result.hits.hits);

    const postIdList: string[] = result.hits.hits.map((item) => {
      return item._id;
    });

    return { _ids: postIdList, count: tagInfo.count, searchSuccess: true };
  }

  async searchPostIdsBySearchString(data: {
    searchString: string;
    page: number;
  }) {
    const pageSize = 12; // 페이지당 수

    const result = await elastic.client.search({
      index: elastic.SnsPostsIndex,
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
    console.log(result.hits.hits);

    const postIdList: string[] = result.hits.hits.map((item) => {
      return item._id;
    });

    return { _ids: postIdList };
  }

  async searchHashtagsBySearchString(data: {
    searchString: string;
    page: number;
  }) {
    const pageSize = 20;
    const result = await elastic.client.search({
      index: elastic.SnsTagsIndex,
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

    const searchedTagList: { tagName: string; count: number }[] =
      result.hits.hits.map((item) => {
        return item._source;
      });

    return { searchedTags: searchedTagList };
  }

  async deletePost(data: { postId: string }) {
    try {
      const targetDoc = await elastic.client.get({
        index: elastic.SnsPostsIndex,
        id: data.postId,
      });
      //get 실패했으면 에러떠서 catch로 간다.

      const tags: string | undefined = targetDoc._source.tags;
      //1. 검색용 데이터를 postIndex에서 삭제
      await elastic.client.delete({
        index: elastic.SnsPostsIndex,
        id: data.postId,
      });

      //2. 검색용 데이터에 tag가 있다면 해당 tag의 카운터 decre
      if (tags === undefined) {
        //태그없으면 걍 리턴
        return;
      }
      tags.split(' ').forEach((item) => {
        return elastic.client.update({
          index: elastic.SnsTagsIndex,
          id: item,
          script: {
            //https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/update_examples.html
            //integer값을 증가시키는법
            lang: 'painless',
            source: 'ctx._source.count--',
          },
        });
      });
      //이건좀 헤비한 작업같은데..
    } catch (error) {
      console.log('elastic에서 post정보 삭제중 에러, 아마 정보가 없을거임');
      console.log(error);
    }
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

//     // elastic.client.index({
//     //   index: elastic.SnsTagsIndex,
//     // id: '강호5',
//     //   document: {
//     //     tagName: '강호 에는 많은 사람이 있어요',
//     //     count: 1,
//     //   },
//     // });

//     // elastic.client
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
//     // elastic.client
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
//     elastic.client
//       .get({
//         index: elastic.SnsTagsIndex,
//         id: tag,
//       })
//       .then((res) => {
//         console.log(`${tag} is exist, count ++`);
//         //2-1. 존재하는 태그면 count 증가
//         elastic.client.update({
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
//         elastic.client.index({
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
