import { io } from 'socket.io-client';

const SocketTest = () => {
  const socket = io({ path: '/dm/socket.io' });

  return <div>socketTest</div>;
};

export default SocketTest;
