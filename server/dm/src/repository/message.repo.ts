import { DirectMessage, pgdb } from './connect.config/initialize.postgres';

export class MessageRepository {
  constructor(private readonly client) {}

  async insertMessage(data: {
    chatRoomId: number;
    speakerId: number;
    messageType: 'text' | 'photo';
    content: string;
    isRead: boolean;
  }): Promise<DirectMessage> {
    const query = `
      INSERT INTO messages ("chatRoomId", "speakerId", "messageType", "content", "isRead")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;`;
    const values = [
      data.chatRoomId,
      data.speakerId,
      data.messageType,
      data.content,
      data.isRead,
    ];

    try {
      const result: { rows: DirectMessage[]; [key: string]: any } =
        await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting message:', error);
      throw error;
    }
  }
}

export const messageRepository = new MessageRepository(pgdb.client);
