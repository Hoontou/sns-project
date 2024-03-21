import { crypter } from '../common/crypter';
import {
  ChatRoomDocType,
  ChatRoomRepository,
  chatRoomRepository,
  ChatRoomWithUserPop,
  emptyChatRoom,
} from '../repository/chatRoom.repo';

export class ChatRoomManager {
  constructor(private readonly chatRoomRepository: ChatRoomRepository) {}

  async requestChatRoomId(data: {
    userId: string;
    chatTargetUserId: string;
  }): Promise<{ chatRoomId: number }> {
    const ownerUserId = Number(crypter.decrypt(data.userId));
    const chatWithUserId = Number(crypter.decrypt(data.chatTargetUserId));

    const chatRoom: ChatRoomDocType | null =
      await this.chatRoomRepository.getChatRoomByUserIds({
        ownerUserId,
        chatWithUserId,
      });

    if (chatRoom !== null) {
      return { chatRoomId: chatRoom.chatRoomId };
    }

    const chatRoomId = await this.chatRoomRepository.createChatRoom({
      ownerUserId,
      chatWithUserId,
    });
    return { chatRoomId };
  }

  async checkChatRoomOwner(data: { chatRoomId: number; userId: number }) {
    const chatRoom: ChatRoomDocType | null =
      await this.chatRoomRepository.getChatRoomByRoomId({
        ownerUserId: data.userId,
        chatRoomId: data.chatRoomId,
      });

    if (chatRoom === null) {
      return { ownerCheckResult: false, chatRoom: emptyChatRoom };
    }
    return { ownerCheckResult: true, chatRoom };
  }

  async updateChatRoom(data: {
    chatRoom: ChatRoomDocType;
    messageForm: { messageType: 'text' | 'photo'; content: string };
    isRead: boolean;
  }) {
    const result: {
      myChatRoom;
      friendsChatRoom;
    } = await this.chatRoomRepository.updateChatRoomAndReturn(data);

    const parsedChatRoom = {
      _id: result.friendsChatRoom?._id,
      chatRoomId: result.friendsChatRoom?.chatRoomId,
      lastTalk: result.friendsChatRoom?.lastTalk,
      lastUpdatedAt: result.friendsChatRoom?.lastUpdatedAt,
      newChatCount: result.friendsChatRoom?.newChatCount,
      totalChatCount: result.friendsChatRoom?.totalChatCount,
      chatWithUserInfo: {
        ...result.friendsChatRoom?.userPop._doc,
        userId: undefined,
      },
    };
    return { myChatRoom: result.myChatRoom, friendsChatRoom: parsedChatRoom };
  }

  async getMyChatRooms(userId: number, page: number) {
    const chatRooms: { [key: string]: any }[] =
      await this.chatRoomRepository.getChatRoomsByUserIdWithUserPop(
        userId,
        page,
      );

    //pop해온 정보 풀어서 넣고 리턴
    const tmp = chatRooms.map((i) => {
      delete i._doc.ownerUserId;
      delete i._doc.chatWithUserId;

      return {
        ...i._doc,
        chatWithUserInfo: { ...i.userPop._doc, userId: undefined },
      };
    });

    return tmp;
  }
}

export const chatRoomManager = new ChatRoomManager(chatRoomRepository);
