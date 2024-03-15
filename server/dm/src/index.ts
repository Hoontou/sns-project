import fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import { rabbitMQ } from './common/amqp';
import { connectMongo } from './database/mongo/initialize.mongo';
import { pgdb } from './database/postgresql/initialize.postgres';
import { dmService } from './common/dm.service';
import { Socket } from 'socket.io';
import { socketManager } from './socketController/socket.manager';
import { crypter } from './common/crypter';
import { SocketEx } from './common/interface';
import { directManager } from './chatRoomController/chatRoom.manager';

const server = fastify();

server.register(fastifyIO);

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined

  server.io.on('connection', (socket: SocketEx) => {
    console.log('connected');
    const userId = Number(crypter.decrypt(socket.handshake.headers.userid));

    //1. 소켓 등록
    socketManager.setSock(userId, socket);

    //2-1. 챗룸 입장
    socket.on('enterChatRoom', async (data: { chatRoomId: number }) => {
      //1) 매니저에 chatroomId 등록 전 chatRoom 소유권 체크
      const ownerCheckResult = await dmService.checkChatRoomOwner({
        chatRoomId: data.chatRoomId,
        userId,
      });

      //2-1) check실패, 유저 내보내기
      if (ownerCheckResult === false) {
        console.log(`check faild, user ${userId}, room ${data.chatRoomId}`);
        socket.emit('cannotEnter');
        return;
      }

      //2-2) check통과, 매니저에 등록, 이후 처리
      console.log(`check success, user ${userId}, room ${data.chatRoomId}`);
      directManager.enterChatRoom(userId, Number(data.chatRoomId));

      //3-1) 상대 userinfo 전송
      //3-2) 채팅기록 싹다 긁어와서 전송
      //3-3) unread였던 채팅기록 read처리

      //3-3++) 상대가 채팅에 들어와있다면 실시간 읽음처리 socket emit 보내기

      return;
    });

    //2-2. inbox 입장
    socket.on('enterInbox', () => {
      console.log(`user ${userId}, inbox`);

      //1) 매니저에 등록
      directManager.enterInbox(userId);

      //2) 내 채팅방 긁어와서 클라이언트에 전송
    });

    //3. dm 전송
    socket.on('sendMessage', (data) => {
      //상대가 direct접속 안해있다면 db만 삽입, 업데이트
      //상대가 inbox에 있다면 db삽입, 업데이트, socket emit
      //상대가 chat room에 들어와있다면 db삽입, 업데이트, socket emit

      return;
    });

    //4. dm 나가기
    socket.on('disconnecting', (reason) => {
      console.log(reason);

      //유저 state 삭제
      directManager.exitDirect(userId);
      socketManager.disconnSock(userId);
    });
  });
});

server.post('/requestChatRoomId', (req, reply) => {
  const body = req.body as { userId: string; chatTargetUserId: string };
  return dmService.requestChatRoomId(body);
});

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  connectMongo();
  pgdb.client.connect((err) => {
    if (err) {
      console.error('vanila pgdb connection error', err.stack);
    } else {
      console.log('vanila pgdb connected');
      pgdb.createTables();
    }
  });
  rabbitMQ.initialize('dm');
  // socketManager.checkManager();
  // directManager.checkManager();
  console.log(`dm on 4009:80`);
});
