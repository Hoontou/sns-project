import { io } from 'socket.io-client';

const AlertSock = () => {
  const socket = io({
    extraHeaders: {
      uuid: localStorage.getItem('userUuid'),
    },
  });
  socket.on('tst', (data) => {
    console.log('소켓수신');
    console.log(data);
  });
  return <div>this is alert socket</div>;
};

export default AlertSock;
