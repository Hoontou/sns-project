import { Injectable, Catch } from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import { elastic } from 'src/configs/elasticsearch';

//해시태그 처리 서비스
@Injectable()
export class HashtagService {
  constructor() {
    const examplePostDto = new PostDto();
    examplePostDto.postId = '1';
    examplePostDto.title = '안녕하세요 #1번태그 #2번태그 녹두로 #333';
    examplePostDto.userId = '34';
    this.handleHashtag(examplePostDto);
    elastic.client
      .get({ index: elastic.SnsTagsIndex, id: '강호3' })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err.body.found);
      });
  }
  //업로드 메서드로부터 오는 해시태그 핸들링 요청
  //해시태그 존재여부 체크후 없으면 추가,
  //해시태그가 사용된 횟수 카운트? 필요할까 업데이트가 꽤 많을듯
  //해시태그 추출, postId와 해시태그 나열해서 엘라스틱에 저장

  handleHashtag(postDto: PostDto) {
    //title로부터 해시태그 추출
    const tmp = postDto.title.match(/#\S+/g);
    if (tmp === null) {
      return;
    }

    const tags = tmp.map((item) => {
      return item.substring(1);
    });

    const tagString = tags.join(' ');
    console.log(tagString);
    console.log(tags);

    //1. 엘라스틱에서 존재하는 태그인지 체크
    //2-1. 존재하는 태그면 count 증가
    //2-2. 존재하지 않으면 새로운 DOC 추가

    //3. post DOC 삽입. 태그일치 검색을 위한 tag문자열, 전문검색을 위한 title 전문

    return;
  }
}
