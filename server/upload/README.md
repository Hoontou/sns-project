흐름정리

클라이언트로부터 파일, 알람uuid, 코멘트 날라옴.

upload MSA는 게시글uuid를 생성해서 그것으로 폴더생성, 파일들은 게시글uuid.사진or영샹번호.원래확장자 로 폴더아래에 저장된다. -> 이것은 미들웨어처리 이며 이것이 끝난 후 다음 로직 실행

1. 저장된 파일은 azure저장소로 전송 후에
   삭제해준다. (비동기)

2. pqdb(mainback)에 게시글uuid, 사진영상갯수, 코멘트 날린다. 래빗MQ  
   -2 는 보류-
   위 방법이 아닌 그냥 main에다가 user의 게시글 카운트를 1 늘리게 하자.
   클라이언트는 특정사용자 프로필 들어가면 main으로부터 게시글 카운트 받아와서 grid만 생성 후
   이후 메타데이터로부터 데이터받아서 grid에 채워넣자. 순서맞춰서.

3. 메타데이터 MSA에 게시글 uuid, 작성자uuid, 코멘트, 사진영상갯수 날린다. 래빗MQ

4. 알람 MSA에 클라이언트로 부터 온 알람 uuid를 날려서 게시글생성중 알람삭제하고 업로드완료 알람 생성하게 한다. 래빗MQ

미들웨어완성, 1번까지 했으니까
234할차례.

또 1번을 매 요청마다 실행하는게 아닌 파일삭제해주는 객체를 만들어서  
알아서 카운트 세서 카운트차면 싹다 삭제하게 만들어보자.

---

azure storage  
https://github.com/Azure-Samples/AzureStorageSnippets/blob/master/blobs/howto/JavaScript/NodeJS-v12/dev-guide/upload-blob-from-local-file-path.js  
https://learn.microsoft.com/ko-kr/azure/storage/blobs/storage-quickstart-blobs-nodejs?tabs=managed-identity%2Croles-azure-portal%2Csign-in-azure-cli#upload-blobs-to-a-container  
마소 Azure제공 코드.

fastify-multer  
https://www.npmjs.com/package/fastify-multer
