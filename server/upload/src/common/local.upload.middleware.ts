import multer from 'fastify-multer';
import { UploadRequest } from './interface';
import { mkdirSync } from 'fs';
import { ObjectId } from './tools/gen.objectid';

//클라이언트로 받은 파일을 저장하기 위해 설정.
const storage = multer.diskStorage({
  destination: (req: UploadRequest, file, cb) => {
    cb(null, `src/files/${req.postId}/`); //파일 저장 경로
  },
  filename: (req: UploadRequest, file, cb) => {
    const fileExtension = file.mimetype.split('/'); //확장자만 추출
    const name = `${req.count}.${fileExtension[fileExtension.length - 1]}`;
    cb(null, name); //파일 이름은 Id.count.확장자
    console.log(`${name} uploaded to local`);
    req.count += 1;
    req.postList.push(name);
  },
});

//storage저장 설정 사용해서 multer 인스턴스? 생성인듯?
const upload = multer({ storage });

//formData로 부터 가져올 애들 명시해서 multer인스턴스로 저장인듯?
const uploadToLoacl = upload.fields([
  { name: 'file', maxCount: 4 },
  { name: 'title', maxCount: 1 },
  { name: 'alert_id', maxCount: 1 },
  { name: 'userId', maxCount: 1 },
]);

const uploadUserImgToLoacl = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'userId', maxCount: 1 },
]);

//파일이름 생성을 위한 Id, count 만들어서 req에 끼워넣는 미들웨어.
const add_idToReq = (req: UploadRequest, reply, next) => {
  req.postId = ObjectId();
  req.count = 0;
  req.postList = [];
  mkdirSync(`./src/files/${req.postId}`, { recursive: true });
  next();
};

export { uploadToLoacl, add_idToReq, uploadUserImgToLoacl };
//파일저장 미들웨어, req에 필요한 변수들생성해주는 미들웨어
