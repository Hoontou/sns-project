import { io } from 'socket.io-client';
import { useState } from 'react';

interface AlertDto {
  _id: string;
  userId: string;
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
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <div>this is alert socket, but no userId</div>;
  } else {
    const socket = io({
      extraHeaders: {
        userid: userId, //헤더 키는 소문자로 날라가더라.
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
          return <div key={`alert${i}`}>${i}</div>;
        })}
      </div>
    );
  }
};

export default AlertSock;
