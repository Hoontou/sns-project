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
}

export const messageManager = new MessageManager(messageRepository);
