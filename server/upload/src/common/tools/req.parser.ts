import { crypter } from './crypter';
import { ParserInterface, UploadRequest } from '../interface';
import { AlertDto, MetadataDto, PostDto } from 'sns-interfaces';

export const reqParser = (req: UploadRequest): ParserInterface => {
  const { title } = JSON.parse(req.body.title);
  const { alert_id } = JSON.parse(req.body.alert_id);
  //추후 알람 MSA에서 사용할 _id, 계획은 _id로 알람 삭제하면 게시물 post성공했다는 뜻.
  //지금 클라이언트가 만들어서 보내주고있음.
  //로직 다 처리하고 알람 삭제해주면 됨
  const { userId } = JSON.parse(req.body.userId); //클라이언트에서 hoc해서 보내준 값이고 암호화 돼있음.
  const decId: string = crypter.decrypt(userId);
  const postId: string = req._id;
  const postList: string[] = req.postList;

  const postingForm: PostDto = {
    postId: postId,
    userId: decId,
  };
  const metadataForm: MetadataDto = {
    _id: postId,
    userId: decId,
    files: postList,
    title,
    createdAt: new Date(),
  };

  const alertForm: AlertDto = {
    //업로드 완료했다는 알람 보내는것
    _id: alert_id,
    userId: decId,
    content: {
      type: 'upload',
      success: true,
      postId,
    },
  };
  return {
    postId,
    postList,
    metadataForm,
    alertForm,
    postingForm,
  };
};
