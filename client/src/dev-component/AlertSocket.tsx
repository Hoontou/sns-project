import { io } from 'socket.io-client';
import { useState } from 'react';

interface AlertDto {
  _id: string;
  userUuid: string;
  type: Upload; //유니온으로 나열할 예정.
  content: UploadResult;
} //타입과 result는 계속해서 추가.

type Upload = 'upload';

interface UploadResult {
  success: boolean;
  post_id: string;
}

const AlertSock = () => {
  const [alertItems, setAlertItems] = useState<Array<string>>([]);
  const userUuid = localStorage.getItem('userUuid');
  if (!userUuid) {
    return <div>this is alert socket, but no useruuid</div>;
  }
  const socket = io({
    extraHeaders: {
      uuid: userUuid,
    },
  });
  socket.on('tst', (data: AlertDto) => {
    console.log('소켓수신');
    setAlertItems([...alertItems, data.content.post_id]);
    console.log(data);
  });
  return (
    <div>
      this is alert socket
      {alertItems.map((i) => {
        return <div>${i}</div>;
      })}
    </div>
  );
};

export default AlertSock;
