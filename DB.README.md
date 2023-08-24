## 1. ELK 셋업

ELK 깃헙참고

https://github.com/deviantony/docker-elk

logstash 등 지금 불필요한 스택은 다 날렸음, 추가정보 필요하면 깃헙참고 하거나

8.9.1버전에 대한 readme는 db/ELK.README에 있음

아래부터 세팅시작

```
docker-compose -f 'db.yml' up setup
```

한 후 정상적 종료되면 성공,

```
docker-compose -f 'db.yml' up
```

이후 엘라스틱서치, 키바나 비밀번호 리셋.

혹은, 그냥 개발단계에서는 .env의 비밀번호들 그냥 elastic으로 해놓고 써도 될듯, 아래 생략가능.

컴포즈 파일 있는 디렉터리에서 실행해야함.

```
docker-compose exec elasticsearch bin/elasticsearch-reset-password -f --batch --user elastic
docker-compose exec elasticsearch bin/elasticsearch-reset-password -f --batch --user kibana_system
```

만약 뭔 에러뜬다면 .env에 이미 값이 채워져 있다는 소리일거고 -f 옵션 붙이면 됨

(지금 그냥 -f 붙여놨음)

각각해서 나온 결과값을 .env의 changeme값에 쓰기

```
docker-compose -f 'db.yml' up -d kibana
```

키바나 재시작한 후에는 elastic_password로 5601 접속가능

## 2. 몽고디비 레플리카셋 설정

mgdb bash접속해서

```
mongosh /usr/src/config/set.js
```

해서 레플리카셋 설정
하고나면 자동으로 monstache가 재시작 계속하면서

엘라스틱이랑 몽고디비 연결함. 몽고디비 레플리카 설정 이후에 몽고디비 연결시작됨.

key설정으로 보안 챙기는게 있는데 지금은 안했음.

이거 쉘스크립트로 생략 가능할거같은데 잘안된다..

## 3. monstache설정

db디렉터리안에 mons.config.toml열어서 설정,

추가로 필요한 설정들은 아래의 공식문서 참고

https://rwynn.github.io/monstache-site/start/

설정바꿨으면 당연히 컨테이너 다시열여야함

제대로 싱크되고있나? 확인하려면

포스트맨 켜서

```
localhost:9200/_cat/indices?v
```

는 mons.config.toml에서 설정한 monstache가 watch할 컬렉션이 인덱스에 잡히는지 체크,

```
localhost:9200/tst.tst/_search/
```

는 watch하라고 설정한 "db이름.컬렉션이름"에 제대로 들어가고있는지 체크.
