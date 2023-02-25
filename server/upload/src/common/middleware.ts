import multer from 'fastify-multer';
import { uploadRequest } from './interface';
import { mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

//클라이언트로 받은 파일을 저장하기 위해 설정.
const storage = multer.diskStorage({
  destination: (req: uploadRequest, file, cb) => {
    cb(null, `files/${req.uuid}/`); //파일 저장 경로
  },
  filename: (req: uploadRequest, file, cb) => {
    const fileExtension = file.originalname.split('.'); //확장자만 추출
    const name = `${req.count}.${fileExtension[fileExtension.length - 1]}`;
    cb(null, name); //파일 이름은 uuid.count.확장자
    req.count += 1;
    req.nameList.push(name);
  },
});

//storage저장 설정 사용해서 multer 인스턴스? 생성인듯?
const upload = multer({ storage });

//formData로 부터 가져올 애들 명시해서 multer인스턴스로 저장인듯?
const uploadToLoacl = upload.fields([
  { name: 'file', maxCount: 4 },
  { name: 'comment', maxCount: 1 },
  { name: 'alertUuid', maxCount: 1 },
  { name: 'userUuid', maxCount: 1 },
]);

//파일이름 생성을 위한 uuid, count 만들어서 req에 끼워넣는 미들웨어.
const addUuidToReq = (req: uploadRequest, reply, next) => {
  req.uuid = uuidv4();
  req.count = 0;
  req.nameList = [];
  mkdirSync(`./files/${req.uuid}`, { recursive: true });
  next();
};

export { uploadToLoacl, addUuidToReq };
//파일저장 미들웨어, req에 필요한 변수들생성해주는 미들웨어
