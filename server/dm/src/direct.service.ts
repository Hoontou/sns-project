import { Socket } from 'socket.io';
import { ChatRoomManager, chatRoomManager } from './managers/chatRoom.manager';
import { MessageManager, messageManager } from './managers/message.manager';
import { SocketManager, socketManager } from './managers/socket.manager';
import {
  UserLocationManager,
  userLocationManager,
} from './managers/userLocation.manager';
import { crypter } from './common/crypter';

class DirectService {
  constructor(
    private chatRoomManager: ChatRoomManager,
    private messageManager: MessageManager,
    private socketManager: SocketManager,
    private userLocationManager: UserLocationManager,
  ) {}

  async registerUser(data: {
    userId: number;
    userLocation: string | 'inbox';
    socket: Socket;
  }) {
    const { userId, userLocation, socket } = data;

    //) location 매니저에 chatroomId 등록 전 chatRoom 소유권 체크
    if (userLocation !== 'inbox') {
      const ownerCheckResult = await this.chatRoomManager.checkChatRoomOwner({
        chatRoomId: Number(userLocation),
        userId: userId,
      });

      //1-2) check실패, 유저 내보내기
      if (ownerCheckResult === false) {
        console.log(`check faild, user ${userId}, room ${userLocation}`);
        //클라이언트로 faild 시그널 보냄
        socket.emit('cannotEnter');
        return;
      }

      //2-2) check통과, 매니저에 등록, 이후 처리
      console.log(`check success, user ${userId}, room ${userLocation}`);
      this.userLocationManager.enterChatRoom(userId, Number(userLocation));
    } else {
      //inbox에 들어왔으면 바로 등록
      this.userLocationManager.enterInbox(userId);
    }
    //소켓도 등록
    this.socketManager.setSock(userId, socket);
  }
}

export const directService = new DirectService(
  chatRoomManager,
  messageManager,
  socketManager,
  userLocationManager,
);
