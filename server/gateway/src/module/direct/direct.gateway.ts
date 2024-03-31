import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { crypter } from '../../common/crypter';
import { DirectService } from './direct.service';
import { ChatRoomSchemaType } from './repository/schema/chatRoom.schema';

@WebSocketGateway({ namespace: 'direct', cors: { origin: '*' } })
export class DirectGateway implements OnGatewayConnection {
  private readonly logger = new Logger(DirectGateway.name);
  constructor(private directService: DirectService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    this.logger.debug('direct socket connected');
    const userId = Number(
      crypter.decrypt(socket.handshake.headers.userid as string),
    );
    const userLocation = socket.handshake.headers.location as string | 'inbox';

    //유저 등록하고 위치한 chatroom 정보 가져오기
    //inbox면 empty값임.
    const chatRoom: ChatRoomSchemaType = await this.directService.registerUser({
      userId,
      userLocation,
      socket,
    });

    //등록완료 후 데이터전송

    //챗룸들어왔으면 누구랑 dm하는지 정보전송, 안읽은 메세지 읽음처리
    if (userLocation !== 'inbox') {
      //3-1) 상대 userinfo 전송
      const friendsInfo = {
        username: chatRoom.userPop?.username,
        introduce: chatRoom.userPop?.introduce,
        introduceName: chatRoom.userPop?.introduceName,
        img: chatRoom.userPop?.img,
      };
      socket.emit('getFriendsInfo', { friendsInfo });

      //3-2) unread였던 채팅기록 read처리
      this.directService.readMessages(chatRoom);
      //3-2++) 상대가 채팅에 들어와있다면 실시간 읽음처리 socket emit 보내기
      socket.emit('init');
    }

    //3-3) 채팅기록 싹다 긁어와서 전송
    socket.on('getMessages', async (data: { startAt?: number }) => {
      return await this.directService.getMessages(
        socket,
        chatRoom,
        data.startAt,
      );
    });

    //2-2. inbox 입장
    //2) 내 채팅방 긁어와서 클라이언트에 전송
    socket.on('getInbox', (data: { page: number }) => {
      return this.directService.getDataForInbox(userId, data.page, socket);
    });

    //3. dm 전송
    socket.on(
      'sendMessage',
      (data: {
        messageForm: {
          messageType: 'text' | 'photo';
          content: string;
          tmpId: number;
        };
      }) => {
        this.directService.sendMessage({
          messageForm: data.messageForm,
          chatRoom,
          socket,
        });

        return;
      },
    );

    //4. dm 나가기
    socket.on('disconnecting', () => {
      this.directService.exitDirect(userId);
    });
  }
}
