import { Socket } from 'socket.io';
import { ChatRoomManager, chatRoomManager } from './managers/chatRoom.manager';
import { MessageManager, messageManager } from './managers/message.manager';
import { SocketManager, socketManager } from './managers/socket.manager';
import {
  UserLocationManager,
  userLocationManager,
} from './managers/userLocation.manager';
import { crypter } from './common/crypter';
import {
  ChatRoomDocType,
  emptyChatRoom,
  chatRoomRepository,
} from './repository/chatRoom.repo';
import { DirectMessage } from './repository/connect.config/initialize.postgres';
import { userModel } from './repository/connect.config/initialize.mongo';

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
  }): Promise<ChatRoomDocType> {
    const { userId, userLocation, socket } = data;

    try {
      if (userLocation === 'inbox') {
        //inbox에 들어왔으면 바로 등록
        this.userLocationManager.enterInbox(userId);
        this.socketManager.setSock(userId, socket);
        return emptyChatRoom;
      }

      //) location 매니저에 chatroomId 등록 전 chatRoom 소유권 체크
      const { ownerCheckResult, chatRoom } =
        await this.chatRoomManager.checkChatRoomOwner({
          chatRoomId: Number(userLocation),
          userId: userId,
        });

      //1-2) check실패, 유저 내보내기
      if (ownerCheckResult === false) {
        //클라이언트로 faild 시그널 보냄
        socket.emit('cannotEnter');
        socket.disconnect();
        throw new Error(`user is not owner of chatroom ${userLocation}`);
      }

      //2-2) check통과, 매니저에 등록, 이후 처리
      this.userLocationManager.enterChatRoom(userId, Number(userLocation));
      this.socketManager.setSock(userId, socket);

      return chatRoom;
    } catch (error) {
      console.log('err while registering user--------');
      console.log(error);

      return emptyChatRoom;
    }
  }

  exitDirect(userId: number) {
    this.userLocationManager.exitDirect(userId);
    this.socketManager.disconnSock(userId);
  }

  async getDataForInbox(userId: number, page: number, socket: Socket) {
    const myChatRooms = await this.chatRoomManager.getMyChatRooms(userId, page);

    return socket.emit('getInbox', { chatRooms: myChatRooms });
  }

  async sendMessage(data: {
    messageForm: {
      messageType: 'text' | 'photo';
      content: string;
      tmpId: number;
    };
    chatRoom: ChatRoomDocType; // ?로 해놨지만 사실 항상 채워져있음
    socket: Socket;
  }) {
    try {
      //상대가 direct접속 안해있다면 db만 삽입, isRead false, 업데이트
      //상대가 inbox에 있다면 db삽입, isRead false, 업데이트, socket emit,
      //상대가 chat room에 들어와있다면 db삽입, isRead true, 업데이트, socket emit

      const friendsState = this.userLocationManager.getUserLocation(
        data.chatRoom.chatWithUserId,
      );
      //1 pgdb삽입
      const sendedMessage: DirectMessage =
        await this.messageManager.sendMessage({
          messageForm: data.messageForm,
          chatRoom: data.chatRoom,
          isRead: friendsState === data.chatRoom.chatRoomId ? true : false,
        });

      //2 몽고 chatroom 업데이트
      const { myChatRoom, friendsChatRoom } =
        await this.chatRoomManager.updateChatRoom({
          ...data,
          isRead: friendsState === data.chatRoom.chatRoomId ? true : false,
        });

      if (friendsState === 'inbox') {
        const friendsSocket = this.socketManager.getSock(
          data.chatRoom.chatWithUserId,
        );

        friendsSocket?.emit('realTimeUpdateForInbox', {
          updatedChatRoom: friendsChatRoom,
        });
      }

      if (friendsState === data.chatRoom.chatRoomId) {
        const friendsSocket = this.socketManager.getSock(
          data.chatRoom.chatWithUserId,
        );

        friendsSocket?.emit('receiveNewMessage', {
          message: {
            id: sendedMessage.id,
            chatRoomId: sendedMessage.chatRoomId,
            isMyChat: false,
            messageType: sendedMessage.messageType,
            content: sendedMessage.content,
            createdAt: sendedMessage.createdAt,
            isRead: sendedMessage.isRead,
          },
        });
      }

      //이후 본인한테도 실시간 정보 보냄
      data.socket.emit('sendingSuccess', {
        tmpId: data.messageForm.tmpId,
      });
    } catch (error) {
      console.log('sending message failed');
      data.socket.emit('sendingFailed', { tmpId: data.messageForm.tmpId });
    }
  }

  async getMessages(
    socket: Socket,
    chatRoom: ChatRoomDocType,
    startAt?: number,
  ) {
    const messages = await this.messageManager.getMessages(
      chatRoom.chatRoomId,
      startAt === 0 ? undefined : startAt,
    );

    const tmp = messages.map((i) => {
      return {
        ...i,
        speakerId: undefined,
        isMyChat: i.speakerId === chatRoom.ownerUserId ? true : false,
      };
    });
    socket.emit('getMessages', { messages: tmp });
  }

  readMessages(chatRoom: ChatRoomDocType) {
    //안읽은 메세지 읽음처리
    this.messageManager.readMessages(chatRoom);
    this.chatRoomManager.readMessages(chatRoom);

    //상대 챗룸에 있으면 읽었다고 실시간 전송

    const friendsState = this.userLocationManager.getUserLocation(
      chatRoom.chatWithUserId,
    );

    if (friendsState !== chatRoom.chatRoomId) {
      //만약 친구가 다른곳에 있다면 바로 리턴
      return;
    }

    const friendsSocket = this.socketManager.getSock(chatRoom.chatWithUserId);
    friendsSocket?.emit('readSignal');
    return;
  }

  async checkHasNewMessage(data: { userId: string }) {
    const userId = crypter.decrypt(data.userId);
    const hasNewMessage = await this.chatRoomManager.checkHasNewMessage(
      Number(userId),
    );

    return { hasNewMessage };
  }
}

export const directService = new DirectService(
  chatRoomManager,
  messageManager,
  socketManager,
  userLocationManager,
);
