## 로컬에서 개발

#### 1. db세팅

```
docker-compose -f 'db.yml' up setup
```

elastic 올리기 전 셋업, exit 뱉을 때 까지 기다린 후

```
docker-compose -f 'db.yml' up
```

하면 postgres, elastic, mongo 올라옴.
이후 monstache 실행 위해 mgdb에 bash 띄워서

```
mongosh /usr/src/config/set.js
```

입력하면 mgdb끼리 레플리카가 됨.

#### 2. 메인서버 띄우기

```
docker-compose up
```

이후 monstache이 제대로 올라왔는지 로그로 체크.

#### 3. nginx

```
docker-compose -f 'nginx.yml' up
```

#### 4. 접속

localhost:3000 으로 접속.

## EC2환경

#### 환경변수 세팅

docker-compose.yml에서

NODE_ENV 항목 모두 삭제

gateway에서

1. AWS_ES_HOST
2. AWS_ES_USERNAME
3. AWS_ES_PASSWORD
4. AWS_POSTGRES_HOST
5. AWS_POSTGRES_USERNAME
6. AWS_POSTGRES_PASSWORD
7. MONGO_URI
8. JWT_SECRET
9. CRYPTO_SECRET

upload에서

1. AZURE_STORAGE_CONNECTION_STRING
2. CRYPTO_SECRET

그다음 db/mons.config.toml에서

1. mongo-url
2. elasticsearch-urls
3. elasticsearch-user, password

작성
