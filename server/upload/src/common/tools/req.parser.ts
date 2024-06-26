import { UploadRequest } from '../interface';
import { UploadMessage } from 'sns-interfaces';
import axios from 'axios';
import { ObjectId } from './gen.objectid';

export const reqParser = (req: UploadRequest): void => {
  const { title } = JSON.parse(req.body.title);
  //추후 알람 MSA에서 사용할 _id, 계획은 _id로 알람 삭제하면 게시물 post성공했다는 뜻.
  //지금 클라이언트가 만들어서 보내주고있음.
  //로직 다 처리하고 알람 삭제해주면 됨
  const { userId } = JSON.parse(req.body.userId); //클라이언트에서 hoc해서 보내준 값이고 암호화 돼있음.
  const postId: string = req.postId;
  const postList: string[] = req.postList;

  const uploadForm: UploadMessage = {
    userId,
    postId,
    files: postList,
    title,
  };

  // rabbitMQ.publishMsg('upload', uploadForm);
  axios.post('http://gateway/upload/post', { uploadForm });
};

export const reqParserForMocking = (userId: number): void => {
  const title = 'mocking data'; //게시물 제목
  const postId: string = ObjectId();
  const postList: string[] = ['test'];

  const uploadForm: UploadMessage = {
    userId: String(userId),
    postId,
    files: postList,
    title,
  };

  // rabbitMQ.publishMsg('upload', uploadForm);
  axios.post('http://gateway/upload/post', { uploadForm });
};

/**user한테 userId랑 img url 쏴준다. */
export const reqParserUserImg = (req: UploadRequest): void => {
  const { userId } = JSON.parse(req.body.userId); //클라이언트에서 hoc해서 보내준 값이고 암호화 돼있음.
  const postId: string = req.postId;
  const postList: string[] = req.postList;

  const form = {
    userId,
    img: `${postId}/${postList[0]}`,
  };

  // rabbitMQ.sendMsg('user', form, 'uploadUserImg');
  axios.post('http://gateway/upload/userImg', { uploadForm: form });
};
