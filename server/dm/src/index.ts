import fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import { rabbitMQ } from './common/amqp';
import { connectMongo } from './repository/connect.config/initialize.mongo';
import { Socket } from 'socket.io';
import { crypter } from './common/crypter';
import { SocketEx } from './common/interface';
import { socketManager } from './managers/socket.manager';
import { userLocationManager } from './managers/userLocation.manager';
import { chatRoomManager } from './managers/chatRoom.manager';
import { pgdb } from './repository/connect.config/initialize.postgres';
import { directService } from './direct.service';

const server = fastify();

server.register(fastifyIO);

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined

  server.io.on('connection', async (socket: SocketEx) => {
    console.log('connected');
    const userId = Number(crypter.decrypt(socket.handshake.headers.userid));
    const userLocation: string | 'inbox' = socket.handshake.headers.location;

    //유저 등록
    await directService.registerUser({
      userId,
      userLocation,
      socket,
    });

    //2-1. 챗룸 입장
    socket.on('enterChatRoom', async (data: { chatRoomId: number }) => {
      //3-1) 상대 userinfo 전송
      //3-2) 채팅기록 싹다 긁어와서 전송
      //3-3) unread였던 채팅기록 read처리

      //3-3++) 상대가 채팅에 들어와있다면 실시간 읽음처리 socket emit 보내기

      return;
    });

    //2-2. inbox 입장
    socket.on('enterInbox', () => {
      //2) 내 채팅방 긁어와서 클라이언트에 전송
    });

    //3. dm 전송
    socket.on(
      'sendMessage',
      (data: {
        messageForm: { messageType: 'text' | 'photo'; content: string };
      }) => {
        //상대가 direct접속 안해있다면 db만 삽입, isRead false, 업데이트
        //상대가 inbox에 있다면 db삽입, isRead false, 업데이트, socket emit,
        //상대가 chat room에 들어와있다면 db삽입, isRead true, 업데이트, socket emit

        chatRoomManager.sendMessage({
          ...data.messageForm,
          chatRoomId: Number(userLocation),
        });
        //(업데이트 = 몽고 챗룸 업데이트, db삽입 = pgdb 메세지 삽입)
        //(socket emit = 상대에게 실시간 정보 보냄)

        //이후 본인한테도 실시간 정보 보냄

        return;
      },
    );

    //4. dm 나가기
    socket.on('disconnecting', (reason) => {
      console.log(reason);

      //유저 state 삭제
      userLocationManager.exitDirect(userId);
      socketManager.disconnSock(userId);
    });
  });
});

server.post('/requestChatRoomId', (req, reply) => {
  const body = req.body as { userId: string; chatTargetUserId: string };
  return chatRoomManager.requestChatRoomId(body);
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
  // userLocationManager.checkManager();
  console.log(`dm on 4009:80`);
});
