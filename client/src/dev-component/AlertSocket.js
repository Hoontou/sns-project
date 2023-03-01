import { io } from 'socket.io-client';

const AlertSock = () => {
  const socket = io({
    extraHeaders: {
      uuid: localStorage.getItem('userUuid'),
    },
  });
  socket.on('tst', (msm) => {
    console.log(msm);
    console.log('소켓수신');
  });
  return <div>this is alert socket</div>;
};

export default AlertSock;
