import { crypter } from '../common/crypter';
import {
  ChatRoomDocType,
  ChatRoomRepository,
  chatRoomRepository,
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
      return false;
    }
    return true;
  }

  async sendMessage(data: {
    messageType: 'text' | 'photo';
    content: string;
    chatRoomId: number;
  }) {
    console.log(data);
    return;
  }
}

export const chatRoomManager = new ChatRoomManager(chatRoomRepository);
