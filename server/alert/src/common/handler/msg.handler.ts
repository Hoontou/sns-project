import { UploadMessage } from 'sns-interfaces';
import { AlertDto, CommentAlert } from 'sns-interfaces/alert.interface';
import { socketManager } from '../../alert.server/socket.manager';
import { alertRepository } from '../../database/alert.repo';

export const msgHandler = (data: {
  method: string;
  whereFrom: string;
  content: AlertDto;
}) => {
  console.log(data);
  if (data.method === 'addComment') {
  }
};

export const uploadHandler = (msg) => {
  //exchange가 upload인 메세지가 여기로 전달됨.
  //key 체크해서 해당 핸들러로 전달.

  const content = JSON.parse(msg.content.toString());
  if (msg.fields.routingKey == 'upload') {
    handleAlert(content);
  }
};

const handleAlert = (content: UploadMessage) => {
  const alertDto: AlertDto = {
    _id: content.alertId,
    userId: content.userId,
    content: {
      type: 'upload',
      success: true,
      postId: content.postId,
    },
  };
  const socket = socketManager.getSocket(content.userId);
  if (socket) {
    socket.emit('tst', alertDto);
    console.log('업로드 소켓전송');
  }
  // console.log(data);
  alertRepository.saveAlert(alertDto); //몽고디비 저장 함수
};
