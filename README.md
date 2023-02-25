# sns-project

인스타그램 같은 sns 만들기, 타이틀은 미정.

리액트, 네스트js, fastify, TS, ORM, 제스트?, rabbitMQ  
postgres(typeorm), mongodb(mongoose), redis, 엘라스틱서치?  
도커, 쿠버네티스, 테라폼, azure, nginx

최대한 TS를 잘 활용해보고, MSA 답게 구현하도록 노력,  
이전 프로젝트에서 서비스 다 만들어갈 때 쯤엔 종잡을 수 없이 개판이라 힘들었다.  
주석도 꾸준하게 달아보자..

---

앱 실행  
docker-compose up --build  
DB 실행  
docker-compose -f "db.yml" up

localhost:3000으로 진입  
/ -> signin  
/signup -> signup  
/up -> 사진영상업로드

---

## main-back - nestjs

유저정보, 게시글, 댓글 관리 - postgres  
리프레시 토큰?  
그냥 가드 통과하면 쿠키 유효기간 다시 달아서 보내면 될거같은데? 서버비용은 좀 더 생각해 봐야겠음.

## sub-back

좋아요, 팔로우 관리 - mongo

## alert

알림 관리 - mongo, 웹소켓

## metadata

사진, 영상 URL 관리 - mongo

## upload - fastify

azure 저장소에 업로드.

## search

프로필 검색 - 엘라스틱?

## 중간정리? 23-02-21

이펙티브TS책 슥 훑고 프로젝트 하고있는데 잘 활용을 못하고있다. 제네릭도 아예 써보질못했다.  
하지만 확실히 TS에 조금씩 적응해가는중.
mongodb도 typeorm으로 하려했지만, 지원하는 mongodb버전이 낮아서 mongoose로 하기로했다.  
여전히 cors는 답답해죽겠다.
혼자 개발중이라 그런지, 테스트코드에 대한 필요성을 못느끼고 있다.  
유닛단위 테스트?가 그냥 콘솔로 계속찍어가면서 하는건가?
E2E는 프런트에서 sample페이지 같이 만들어서 계속 진행중이긴 한데..
지금은 수동으로 회원가입페이지, 로그인페이지, 업로드페이지 순으로 들어가서 요청을 날리는중.
upload에서 래빗메세지 뿌리기, 각각의 MSA에서 수신로직까지 만들고 난 후에  
E2E를 쫙 한번 짜보자.
fastify 정보가 별로없어서 답답하긴 한데 서드파티 패키지? 들까지 다 ts를 잘써줘서 확실히 편하다.  
지금까지 진행하면서 예전엔 구글검색이 90프로였다면 지금은 코드까보기 + 공식DOCS보는게 70퍼정도는 차지한다.  
무엇보다, 공식DOCS가 제일 정확하다는걸 깨닳고있다.

리팩토링, 성능개선 최적화는 끝이 없는것같다. 구현해놓고 다시보면 눈에밟히는게 많다.  
새로운 기능 만드는것 만큼이나 머리를 계속 굴리게 된다.  
대충 넘어가다가는 전 프로젝트 꼴이 날테니까..

## 래빗MQ 연결

https://github.com/amqp-node/amqplib/tree/main/examples/tutorials  
https://www.rabbitmq.com/getstarted.html  
공식문서, 구글링 통해서 몇시간의 삽질 끝에 제대로 연결성공. 래빗이 작동을 안했는데,  
tsconfig의 모듈: commonjs라서 오류가 발생하는것 같음. commonjs식으로 require하면 작동한다.  
네스트의 기본 tsconfig을 가져와서 쓰다보니 이미 익숙해져있는데 바꾸기란 쉽지 않겠다고 판단.  
그래서 문서, 구글링, 삽질 통해서 쉽게 쓸수있게 패턴화 시켰음.
각 msa의 src/common/amqp.ts에 래빗코드를 싹 정리해놨다.  
저걸 다른프로젝트에도 그냥 가져다쓰기만 하면 될것임.
각각의 로직에 맞게 메세지 컨슘만 수정하면 됨.  
ex) forEach문 안에 if (que == 컨슘사용할 큐) {channel.consume(컨슘로직작성)}
