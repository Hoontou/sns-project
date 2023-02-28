import { io } from 'socket.io-client';

const AlertSock = () => {
  const socket = io();
  return <div>this is alert socket</div>;
};

export default AlertSock;
