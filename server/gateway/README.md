# 회원가입, 로그인, 인증인가

## 4000/user/signup 회원가입

### req

{ email: hoontou@gmail.com,  
username: hoon,  
password: test}

### res

{success: boolean}

## 4000/user/signin 로그인

### req

{email, passoword}

### res

성공시 {success: true}, 쿠키에 Authorization: jwt토큰이랑 uuid, username 담김
실패시 오류뜸.

## 4000/user/hoc 인증인가

### req

필요한건 없고, signin에서 받은 쿠키가 있어야함.

### res

{success: boolean}

---

typeorm 오류나서 그냥 바닐라 쿼리 날리기 위해 pg모듈 쓴다.
https://node-postgres.com/apis/client

---

23.03.13
포스트, 코멘트, 코코멘트 좋아요를 지금은 하나의 테이블에서 업데이트하는데,
반드시 분리해야할듯. postgres에서 잦은 업데이트는 위험하니까...
이것을 섭백으로 빼서 몽고디비로 처리할지 고민이다.

각각에 대해 테이블 하나씩 포린키로 붙여서
join거는게 제일 편하긴 할듯.

post테이블엔 카운트 놔두고
commentm, ccomment테이블에서는 카운트 분리함.

다시 생각해보니 메인백에도 몽고디비 붙여서 카운트기능을 몽고디비로 빼는게 맞는것같다.
나중가면 카운트 업데이트가 미친듯이 불어날텐데, pgdb가 성능이 좋다고는 하나 몽고디비가 더 빠르지 않을까?

pgdb의 성능만 따라준다면 RDB기능 쓸수있는 pg를 쓸텐데, 실제성능이 어떤지 검색좀해봐야할듯.
