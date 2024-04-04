creamisbeast.xyz

# sns 프로젝트

인스타그램을 클론코딩 하는 느낌으로 sns을 만들어보자.

### 주요 스택

    FRONT - react

    BACK - nestjs grpc-node rabbitmq docker

    DB - postgres mongodb elasticsearch

를 주요스택으로 해서 MSA로 만들었으나,

배포하려고 보니 사이즈가 너무커서 grpc 서비스들을 nestjs로 통합 후 배포함.

msa구조 까지의 기록은 lastmsacommit 브랜치에.

# 프로젝트 구조 요약

크게 FRONT, GATEWAY(+UPLOAD), GRPC SERVICES, DB

네가지 덩어리.

## CLIENT

CLIENT는 사진 upload의 요청은 업로드 서버(fastify)로,

이외의 모든 요청은 gateway서버(nestjs)로 전송.

## GATEWAY, UPLOAD

요청을 받은 gateway는 아래와 같이 요청처리.

##### case 1) 요청에 대한 리턴이 필요할 경우

필요한 데이터들을 grpc통신으로 서비스들에게 요청 후,

각각의 서비스로 부터 받은 데이터를 조립 후 클라이언트에게 리턴.

##### case 2) 요청에 대한 리턴이 필요없는 경우

rabbitmq로 메세지 send or publish.

### UPLOAD

client로 부터 사진 업로드 요청이 오면

1. 배포환경인지 로컬환경인지 보고 로컬 or azure 파일 서비스에 업로드

2. 사진 업로드 정보(user, path, filename) 등을 rabbit을 이용해 서비스들에게 publish

## GRPC SERVICES

grpc요청과 rabbit 메세지를 처리, 필요하다면 rabbit으로 메세지 전송.

자신의 관할이 아닌 데이터를 보거나 쓰는건 '최대한' 자제.

## DB

데이터 특성에 맞게 DB를 선택하려고 노력했음.

postgres -> typeorm과 pg 패키지로 연결
mongoDB -> 몽구스
elasticsearch -> elasticsearch 패키지로 연결 + monstache와 mongodb 연동

## 하지만..

배포 위해 grpc들을 싹다 nestjs로 통합.

# 배포

EC2에 docker-compose로 서버 open

postgres -> AWS RDS

elasticsearch -> AWS Opensearch

mongoDB -> atlas에 올리려 했지만 클러스터 돈아까워서 ec2에 올렸음

사진 storage는 ms azure 저장소 사용.

### 프로젝트 실행은 HOWTOSTART.md

### msa로 실행은 lastmascommit 브랜치로가서 HOWTOSTART.md
