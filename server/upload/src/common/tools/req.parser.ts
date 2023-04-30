import { crypter } from './crypter';
import { UploadRequest } from '../interface';
import { UploadMessage } from 'sns-interfaces';
import { rabbitMQ } from '../amqp';

export const reqParser = (req: UploadRequest): void => {
  const { title } = JSON.parse(req.body.title);
  const { alert_id } = JSON.parse(req.body.alert_id);
  //추후 알람 MSA에서 사용할 _id, 계획은 _id로 알람 삭제하면 게시물 post성공했다는 뜻.
  //지금 클라이언트가 만들어서 보내주고있음.
  //로직 다 처리하고 알람 삭제해주면 됨
  const { userId } = JSON.parse(req.body.userId); //클라이언트에서 hoc해서 보내준 값이고 암호화 돼있음.
  const postId: string = req.postId;
  const postList: string[] = req.postList;

  const uploadForm: UploadMessage = {
    userId,
    postId,
    alertId: alert_id,
    files: postList,
    title,
    createdAt: new Date(),
  };

  console.log('broadcasting to MSA');
  rabbitMQ.publishMsg('upload', uploadForm);
};
