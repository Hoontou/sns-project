import fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import { socketManager } from './alert.server/socket.manager';
import { SocketEx } from './common/interface';
import { crypter } from './common/crypter';
import { rabbitMQ } from './common/amqp';
const server = fastify();

server.register(fastifyIO);

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined
  server.io.on('connection', (socket: SocketEx) => {
    const userUuid: string = crypter.decrypt(socket.handshake.headers.uuid);
    socketManager.setSock(userUuid, socket);
    //useruuid랑 소켓이랑 연결해서 정보저장.
    console.log(userUuid, 'connected');
    //테스트코드, 매번 새 연결마다 소켓정보 잘 업데이트 됨.
    //console.log(socketManager.container[userUuid].id);

    socket.on('disconnecting', (reason) => {
      socketManager.disconnSock(userUuid);
      console.log(userUuid, 'disconn');
      //테스트코드, 연결종료 시 소켓정보 날려버림.
      //console.log(socketManager.container);
    });
  });
});

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  rabbitMQ.initialize(['metadata', 'alert']);
  console.log(`Server listening at ${address}`);
});
