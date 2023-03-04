import { crypter } from './crypter';
import {
  AlertDto,
  MetadataDto,
  parserInterface,
  uploadRequest,
} from '../interface';

export const reqParser = (req: uploadRequest): parserInterface => {
  const { title } = JSON.parse(req.body.title);
  const { alert_id } = JSON.parse(req.body.alert_id);
  //추후 알람 MSA에서 사용할 _id, 계획은 _id로 알람 삭제하면 게시물 post성공했다는 뜻.
  //지금 클라이언트가 만들어서 보내주고있음.
  //로직 다 처리하고 알람 삭제해주면 됨
  const { userUuid } = JSON.parse(req.body.userUuid); //클라이언트에서 hoc해서 보내준 값이고 암호화 돼있음.
  const decUuid: string = crypter.decrypt(userUuid);
  const post_id: string = req._id;
  const postList: string[] = req.postList;

  const metadataForm: MetadataDto = {
    _id: post_id,
    userUuid: decUuid,
    files: postList,
  };

  const alertForm: AlertDto = {
    //업로드 완료했다는 알람 보내는것
    _id: alert_id,
    userUuid: decUuid,
    type: 'upload',
    content: {
      success: true,
      post_id,
    },
  };
  return {
    title,
    post_id,
    postList,
    metadataForm,
    alertForm,
  };
};
