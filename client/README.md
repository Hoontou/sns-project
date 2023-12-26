구상중인것.

1. 알람 처음에 다 가져오고 이후엔 새로고침해도 안가져오게
   -> 구글에 리덕스 새로고침 검색.
2. api gateway MSA 설치할 예정.

////////////////

빌드해서 nginx를 client로 넣을려면
dockerfile2로 도커파일 대체하고 메인 dockercompose 가서 client의 포트포워딩을 client컨테이너의 80포트로 해주면 됨
