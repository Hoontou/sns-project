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
DB 실행, 이거 다운시키면 db 초기화됨.  
docker-compose -f "db.yml" up  
nginx 실행 백단 로그체크에 방해돼서 따로 빼놓음.  
docker-compose -f "nginx.yml" up

순서는 db업, 메인 업, nginx 업
보안필요한 환경변수나 그런거 따로안빼놔서 그냥 도커로 up만하면 실행가능.

localhost:3000으로 진입  
/ -> signin  
/signup -> signup  
/up -> 사진영상업로드, 사진 entity 크기제한 걸려있어서 지금은 용량작은 사진만 업로드가능.  
/post -> 내가업로드한거 불러옴

---

## main-back - nestjs

유저정보, 게시글, 댓글 관리 - postgres  
리프레시 토큰?  
그냥 가드 통과하면 쿠키 유효기간 다시 달아서 보내면 될거같은데? 서버비용은 좀 더 생각해 봐야겠음.

## sub-back - grpc(nest?)

좋아요, 팔로우 관리 - mongo

## post - nest/grpc

글, 댓글, 대댓글 관리 - nest, postgres

## alert - fastify

알림 관리 - mongo, 웹소켓

## metadata - grpc

사진, 영상 URL 관리 - mongo

## upload - fastify

azure 저장소에 업로드.

## search

프로필 검색 - 엘라스틱?

## cache

레디스 fastify로 캐시서버 구현
