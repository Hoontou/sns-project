import { crypter } from '../common/crypter';
import { ChatRoomDocType } from '../repository/chatRoom.repo';
import {
  MessageRepository,
  messageRepository,
} from '../repository/message.repo';

export class MessageManager {
  constructor(private messageRepository: MessageRepository) {}

  sendMessage(data: {
    chatRoom: ChatRoomDocType;
    messageForm: {
      messageType: 'text' | 'photo';
      content: string;
    };
    isRead: boolean;
  }) {
    const insertForm: {
      chatRoomId: number;
      speakerId: number;
      messageType: 'text' | 'photo';
      content: string;
      isRead: boolean;
    } = {
      chatRoomId: data.chatRoom.chatRoomId,
      speakerId: data.chatRoom.ownerUserId,
      messageType: data.messageForm.messageType,
      content: data.messageForm.content,
      isRead: data.isRead,
    };

    return this.messageRepository.insertMessage(insertForm);
  }

  async getMessages(chatRoomId: number, startAt?: number) {
    const messages = await this.messageRepository.getMessages(
      chatRoomId,
      startAt,
    );

    if (messages.length === 0) {
      return [];
    }

    const encryptedId = crypter.encrypt(messages[0].speakerId);

    const tmp = messages.map((i) => {
      return { ...i, userId: encryptedId };
    });

    return tmp;
  }

  readMessages(chatRoom: ChatRoomDocType) {
    return this.messageRepository.readMessages(chatRoom);
  }
}

export const messageManager = new MessageManager(messageRepository);
