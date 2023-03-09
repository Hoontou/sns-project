import { io } from 'socket.io-client';
import { useState } from 'react';

interface AlertDto {
  _id: string;
  userId: string;
  content: UploadResult;
} //타입과 result는 계속해서 추가.

type Upload = 'upload';

interface UploadResult {
  type: Upload; //유니온으로 나열할 예정.
  success: boolean;
  postId: string;
}

const AlertSock = () => {
  const [alertItems, setAlertItems] = useState<Array<UploadResult>>([]);
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
      setAlertItems([...alertItems, data.content]);
      console.log(data);
    });
    return (
      <div>
        this is alert socket
        {alertItems.map((i) => {
          return (
            <div key={i.type}>
              {i.type}, {i.postId}
            </div>
          );
        })}
      </div>
    );
  }
};

export default AlertSock;
