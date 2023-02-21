백엔드 API작성

---

# 회원가입, 로그인, 인증인가

## 4000/user/signup 회원가입

### req

{ email: hoontou@gmail.com,  
username: hoon,  
password: test}

### res

{이메일, 이름, 해쉬된 비번, uuid, createdAt}

## 4000/user/signin 로그인

### req

{email, passoword}

### res

성공시 {success: true}, 쿠키에 Authorization: jwt토큰, uuid username담김
실패시 오류뜸.

## 4000/user/hoc 인증인가

### req

필요한건 없고, signin에서 받은 쿠키가 있어야함.

### res

{success: boolean}

# 파일업로드

## localhost:3000/up 페이지로 접근

파일 찾아서 넣고 코멘트 입력하면  
upload MSA 로컬에 저장 -> azure로 전송 -> 로컬파일 삭제  
순서로 진행됨.

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
