import { io } from 'socket.io-client';
import { useState } from 'react';
import { AlertContentUnion, AlertDto } from 'sns-interfaces';

const AlertSock = (props: { userId: string }) => {
  const [alertItems, setAlertItems] = useState<Array<AlertContentUnion>>([]);
  // const userId = localStorage.getItem('userId');
  // if (!userId) {
  //   return <div>this is alert socket, but no userId</div>;
  // } else {
  const socket = io({
    extraHeaders: {
      userid: props.userId, //헤더 키는 소문자로 날라가더라.
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
        return <div key={i.type}>{i.type}</div>;
      })}
    </div>
  );
  // }
};

export default AlertSock;
