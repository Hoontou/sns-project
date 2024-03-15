import {
  MessageRepository,
  messageRepository,
} from '../repository/message.repo';

class MessageManager {
  constructor(private messageRepository: MessageRepository) {}
}

export const messageManager = new MessageManager(messageRepository);
