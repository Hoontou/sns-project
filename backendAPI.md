백엔드 API작성

---

# 회원가입, 로그인, 인증인가

## 4000/user/signup

### req

{ email: hoontou@gmail.com,  
username: hoon,  
password: test}

### res

{이메일, 이름, 해쉬된 비번, uuid, createdAt}

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
