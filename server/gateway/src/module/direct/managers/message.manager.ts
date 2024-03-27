import { MessageRepository } from '../repository/message.repository';
import { ChatRoomSchemaType } from '../repository/schema/chatRoom.schema';

export class MessageManager {
  constructor(private messageRepository: MessageRepository) {}

  sendMessage(data: {
    chatRoom: ChatRoomSchemaType;
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

    return messages;
  }

  readMessages(chatRoom: ChatRoomSchemaType) {
    return this.messageRepository.readMessages(chatRoom);
  }
}
