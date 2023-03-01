import { io } from 'socket.io-client';

const AlertSock = () => {
  if (localStorage.getItem('userUuid')) {
    const socket = io({
      extraHeaders: {
        uuid: localStorage.getItem('userUuid'),
      },
    });
  }

  return <div>this is alert socket</div>;
};

export default AlertSock;
