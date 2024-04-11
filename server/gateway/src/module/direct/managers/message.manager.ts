import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../repository/message.repository';
import { ChatRoomSchemaDefinition } from '../repository/schema/chatRoom.schema';

@Injectable()
export class MessageManager {
  constructor(private messageRepository: MessageRepository) {}

  sendMessage(data: {
    chatRoom: ChatRoomSchemaDefinition;
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

  readMessages(chatRoom: ChatRoomSchemaDefinition) {
    return this.messageRepository.readMessages(chatRoom);
  }
}
