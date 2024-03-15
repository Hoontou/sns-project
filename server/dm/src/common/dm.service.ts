import {
  ChatRoomDocType,
  ChatRoomRepository,
  chatRoomRepository,
} from '../database/mongo/chatRoom.repo';
import { crypter } from './crypter';

class DmService {
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
      console.log(chatRoom.chatRoomId);
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
      return false;
    }
    return true;
  }
}

export const dmService = new DmService(chatRoomRepository);
