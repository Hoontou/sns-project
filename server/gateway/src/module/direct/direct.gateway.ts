import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { crypter } from '../../common/crypter';
import { DirectService } from './direct.service';
import { ChatRoomSchemaDefinitionExecPop } from './repository/schema/chatRoom.schema';

@WebSocketGateway({ namespace: 'direct', cors: { origin: '*' } })
export class DirectGateway implements OnGatewayConnection {
  private readonly logger = new Logger(DirectGateway.name);
  constructor(private directService: DirectService) {}

  private async initUserState(socket: Socket): Promise<{
    userId: number;
    userLocation: string | 'inbox';
  }> {
    return new Promise((resolve, reject) => {
      //3초
      const timeoutSec = 3000;

      const timer = setTimeout(() => {
        reject('time out when direct init');
      }, timeoutSec);

      //소켓연결 후 정보요청 보냄
      socket.emit(
        'gimmeUrState',
        (res: { userId: string; location: string | 'inbox' }) => {
          clearTimeout(timer);
          resolve({
            userId: crypter.decrypt(res.userId),
            userLocation: res.location,
          });
        },
      );
    });
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    this.logger.debug('direct socket connected');

    //1.유저 정보요청 보냄
    const { userId, userLocation } = await this.initUserState(socket).catch(
      (err) => {
        this.logger.error(err);
        return { userId: 0, userLocation: '0' };
      },
    );

    //init 타임아웃 시 조기종료
    if (userId === 0) {
      this.logger.error('socket disconnected because init timeout');
      socket.disconnect();
      return;
    }

    try {
      //2. 유저 등록하고 위치한 chatroom 정보 가져오기
      //inbox면 empty값임.
      const chatRoom: ChatRoomSchemaDefinitionExecPop =
        await this.directService.registerUser({
          userId: userId,
          userLocation,
          socket,
        });

      //3. 이후 핸들러 등록

      /**chatroom에 들어와서 상대 정보 요청받는 핸들러*/
      socket.on('getFriendsInfo', () => {
        //1) 상대 userinfo 전송
        const friendsInfo = chatRoom.userPop && {
          username: chatRoom.userPop.username,
          introduce: chatRoom.userPop.introduce,
          introduceName: chatRoom.userPop.introduceName,
          img: chatRoom.userPop.img,
        };
        socket.emit('getFriendsInfo', { friendsInfo });

        //2) unread였던 채팅기록 read처리
        // + 상대가 채팅에 들어와있다면 실시간 읽음처리 소켓전송
        return this.directService.readMessages(chatRoom);
      });

      /**chatroom에 들어와서 채팅기록 요청받는 핸들러*/
      socket.on('getMessages', (data: { startAt?: number }) => {
        return this.directService.getMessages(socket, chatRoom, data.startAt);
      });

      /**inbox에 들어와서 내 채팅방 전송 요청받는 핸들러 */
      socket.on('getInbox', (data: { page: number }) => {
        return this.directService.getDataForInbox(userId, data.page, socket);
      });

      /**chatroom에서 메세지 전송 핸들러 */
      socket.on(
        'sendMessage',
        (data: {
          messageForm: {
            messageType: 'text' | 'photo';
            content: string;
            tmpId: number;
          };
        }) => {
          return this.directService.sendMessage({
            messageForm: data.messageForm,
            chatRoom,
            socket,
          });
        },
      );

      //4. dm 나가기
      socket.on('disconnecting', () => {
        return this.directService.exitDirect(userId);
      });

      //서버측에서 on 등록 후 ready 전송
      socket.emit('init');
    } catch (error) {
      //에러 시 exit처리 후 연결끊기
      this.logger.error(error);
      this.logger.error('socket disconnected because err');
      this.directService.exitDirect(userId);

      socket.disconnect();
    }
  }
}
