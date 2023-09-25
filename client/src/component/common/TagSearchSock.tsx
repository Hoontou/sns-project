import { io } from 'socket.io-client';

const TagSearchSock = () => {
  const socket = io();
  socket.on('tst', (data) => {});
  return <div>this is searchSock</div>;
  // }
};

export default TagSearchSock;
