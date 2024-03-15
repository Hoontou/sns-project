import { pgdb } from './connect.config/initialize.postgres';

export class MessageRepository {
  constructor(private readonly client) {}

  async insertMessage(chatRoomId, speakerId, messageType, content, isRead) {
    const query = `
      INSERT INTO messages ("chatRoomId", "speakerId", "messageType", "content", "isRead")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;`;
    const values = [chatRoomId, speakerId, messageType, content, isRead];

    try {
      const result = await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting message:', error);
      throw error;
    }
  }
}

export const messageRepository = new MessageRepository(pgdb.client);
