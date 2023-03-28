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
    const userId: string = crypter.decrypt(socket.handshake.headers.userid);
    //헤더 키는 소문자로 온다. userId가 아닌 userid
    socketManager.setSock(userId, socket);
    //userId랑 소켓이랑 매핑해서 정보저장.
    console.log(userId, 'connected');

    //테스트코드, 매번 새 연결마다 소켓정보 잘 업데이트 됨.
    //console.log(socketManager.container[userId].id);

    socket.on('disconnecting', (reason) => {
      socketManager.disconnSock(userId);
      console.log(userId, reason);
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
  rabbitMQ.initialize(['alert']);
  console.log(`alert on 4004:80`);
});
