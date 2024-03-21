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
import { ChatRoomDocType } from './repository/chatRoom.repo';

const server = fastify();

server.register(fastifyIO);

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined

  server.io.on('connection', async (socket: SocketEx) => {
    const userId = Number(crypter.decrypt(socket.handshake.headers.userid));
    const userLocation: string | 'inbox' = socket.handshake.headers.location;

    console.log(`user ${userId} connected, ${userLocation}`);

    //유저 등록하고 위치한 chatroom 정보 가져오기
    //inbox면 empty값임.
    const chatRoom: ChatRoomDocType = await directService.registerUser({
      userId,
      userLocation,
      socket,
    });

    //등록완료 후 데이터전송

    //챗룸들어왔으면 누구랑 dm하는지 정보전송, 안읽은 메세지 읽음처리
    if (userLocation !== 'inbox') {
      //2-1. 챗룸 입장
      //3-1) 상대 userinfo 전송
      //3-2) unread였던 채팅기록 read처리
      //3-2++) 상대가 채팅에 들어와있다면 실시간 읽음처리 socket emit 보내기

      // directService.readMessages(chatRoom);
      //client에서 display 다만든 후 주석풀자

      const friendsInfo = {
        username: chatRoom.userPop?.username,
        introduce: chatRoom.userPop?.introduce,
        introduceName: chatRoom.userPop?.introduceName,
        img: chatRoom.userPop?.img,
      };
      socket.emit('getFriendsInfo', { friendsInfo });
    }

    //3-3) 채팅기록 싹다 긁어와서 전송
    socket.on('getMessages', (data: { startAt?: number }) => {
      console.log(1);
      return directService.getMessages(
        socket,
        chatRoom.chatRoomId,
        data.startAt,
      );
    });

    //2-2. inbox 입장
    //2) 내 채팅방 긁어와서 클라이언트에 전송
    socket.on('getInbox', (data: { page: number }) => {
      return directService.getDataForInbox(userId, data.page, socket);
    });

    //3. dm 전송
    socket.on(
      'sendMessage',
      (data: {
        messageForm: { messageType: 'text' | 'photo'; content: string };
      }) => {
        directService.sendMessage({
          messageForm: data.messageForm,
          chatRoom,
          socket,
        });

        return;
      },
    );

    //4. dm 나가기
    socket.on('disconnecting', (reason) => {
      console.log(reason);
      directService.exitDirect(userId);
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
