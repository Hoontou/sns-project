import multer from 'fastify-multer';
import { UploadRequest } from './interface';
import { ObjectId } from './tools/gen.objectid';

//메모리에 저장. req.files로 접근할 수 있다.
//근데 처리가 밀리면 위험함. 일단 최대사이즈를 4mb로 잡아놓긴 했다.
//nginx와 client 사진 리사이징 에서 조절가능
const storage = multer.memoryStorage();
const upload = multer({ storage });

//formData로 부터 가져올 애들 명시해서 multer인스턴스로 저장인듯?
//file은 req.files로 접근, 나머지 text field는 바디로 접근가능.
const uploadToMemory = upload.fields([
  { name: 'file', maxCount: 4 },
  { name: 'title', maxCount: 1 },
  { name: 'alert_id', maxCount: 1 },
  { name: 'userId', maxCount: 1 },
]);

//파일이름 생성을 위한 Id, count 만들어서 req에 끼워넣는 미들웨어.
const preParser = (req: UploadRequest, reply, next) => {
  req.files = req.files.file;
  //console.log(req.files);
  //File[] 인데, 아래 map에서 File에 mimetype이 없다고해서 못쓰는중
  //req.files 구조 수정해서 넥스트로 넘긴다. 뒤에선 바로 files로 접근가능

  req.postId = ObjectId();
  req.postList = [...req.files].map((file, index) => {
    const fileExtension = file.mimetype.split('/'); //확장자만 추출
    const name = `${index}.${fileExtension[fileExtension.length - 1]}`;
    //0.png, 1.jpg 이런식으로
    return name;
  });

  req.bufferList = [...req.files].map((file) => {
    return file.buffer;
  }); //받은 파일에서 버퍼만 떼서 파싱

  next();
};

export { uploadToMemory, preParser };
//파일저장 미들웨어, req에 정보 넣어주는 미들웨어
