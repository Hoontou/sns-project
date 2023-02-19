# sns-project

인스타그램 같은 sns 만들기, 타이틀은 미정.

리액트, 네스트js, fastify, TS, (typeorm or prisma), 제스트, rabbitMQ  
postgres, mongodb, redis, (엘라스틱서치 써보고싶다)  
도커, 쿠버네티스, 테라폼, azure, nginx

최대한 TS를 잘 활용해보고, MSA 답게 구현하도록 노력,  
이전 프로젝트에서 서비스 다 만들어갈 때 쯤엔 종잡을 수 없이 개판이라 힘들었다.  
주석도 꾸준하게 달아보자..

데이터 특성에 맞게 DB를 고르려고 노력

---

앱 실행  
docker-compose up --build  
DB 실행  
docker-compose -f "docker-compose-db.yml" up

localhost:3000으로 진입

---

## main-back - nestjs

유저정보, 게시글, 댓글 관리 - postgres

## sub-back

좋아요, 팔로우 관리 - mongo

## notification

알림 관리 - mongo

## metadata

사진, 영상 URL 관리 - mongo

## upload

azure 저장소에 업로드 - azure storage

## search

프로필 검색 - 엘라스틱?
