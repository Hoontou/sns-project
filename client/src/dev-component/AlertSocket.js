import { io } from 'socket.io-client';
import { useState } from 'react';

const AlertSock = () => {
  const [alertItems, setAlertItems] = useState([]);
  const socket = io({
    extraHeaders: {
      uuid: localStorage.getItem('userUuid'),
    },
  });
  socket.on('tst', (data) => {
    console.log('소켓수신');
    setAlertItems([data.content.post_id, ...alertItems]);
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
