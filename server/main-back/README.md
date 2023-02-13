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

성공시 {success: true}, 쿠키에 Authorization: jwt토큰 담김,
실패시 오류뜸.

## 4000/user/hoc 인증인가

### req

필요한건 없고, signin에서 받은 쿠키가 있어야함.

### res

적절한 토큰이면 {이메일, 이름, 해쉬된 비번, uuid, createdAt},  
 아니라면 오류.
