import fastify from 'fastify';
import multer from 'fastify-multer';
import { uploadToAzure } from './azure.storage';
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';
import { uploadRequest } from './interface'; //req 파라미터의 타입 명시를 해줘야함.
const server = fastify();

//azure 스토리지 접근을 위한 string키
const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) {
  throw Error('missing connString');
}
const client = BlobServiceClient.fromConnectionString(connString);

//클라이언트로 받은 파일을 저장하기 위해 설정.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'files/'); //파일 저장 경로
  },
  filename: (req: uploadRequest, file, cb) => {
    const fileExtension = file.originalname.split('.'); //확장자만 추출
    const name = `${req.uuid}.${req.count}.${
      fileExtension[fileExtension.length - 1]
    }`;
    cb(null, name); //파일 이름은 uuid.count.확장자
    req.count += 1;
    req.nameList.push(name);
  },
});
const upload = multer({ storage });
server.register(multer.contentParser);

//여기서 file은 클라이언트에서 적은 키값, 4개이상 들어오면 status 413 날라간다.
//클라이언트에서 4개까지만 컷해서 보내주고 있음 지금.

//파일이름 생성을 위한 uuid, count 만들어서 req에 끼워넣는 미들웨어.
const addUuidToReq = (req, reply, next) => {
  req.uuid = uuidv4();
  req.count = 0;
  req.nameList = [];
  next();
};
//formData로 부터 가져올 애들 명시
const cpUpload = upload.fields([
  { name: 'file', maxCount: 4 },
  { name: 'comment', maxCount: 1 },
  { name: 'alertUuid', maxCount: 1 },
]);
server.post(
  //메인 로직
  '/uploadfiles',
  { preHandler: [addUuidToReq, cpUpload] }, //uuid생성 미들웨어 먼저 호출.
  async (req: uploadRequest, reply) => {
    const { comment } = JSON.parse(req.body.comment);
    const { alertUuid } = JSON.parse(req.body.alertUuid);
    //추후 알람 MSA에서 사용할 uuid, 계획은 uuid로 알람 삭제하면 게시물 post성공했다는 뜻.
    //로직 다 처리하고 알람 삭제해주면 됨
    const postUuid: string = req.uuid; //post식별할 uuid
    const postCount: number = req.count + 1; //저장할땐 0부터 했는데 이제 1더해주자
    const postList: string[] = req.nameList;
    console.log('start uploading');
    console.log(postList);
    console.log('======azure status======');
    await uploadToAzure(client, postList, postUuid);
    console.log('======upload end======');
  },
);

server.listen({ host: '0.0.0.0', port: 4001 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
