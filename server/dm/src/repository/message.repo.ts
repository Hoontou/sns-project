import { ChatRoomDocType } from './chatRoom.repo';
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

  async getMessages(chatRomId: number, startAt?: number) {
    const limit = 15;

    const query = startAt
      ? `SELECT * FROM messages
    WHERE "chatRoomId" = ${chatRomId}
    AND id <= ${startAt}
    ORDER BY id DESC
    LIMIT ${limit};`
      : `SELECT * FROM messages
    WHERE "chatRoomId" = ${chatRomId}
    ORDER BY id DESC
    LIMIT ${limit};`;

    const result: { [key: string]: any; rows: DirectMessage[] } =
      await this.client.query(query);

    return result.rows;
  }

  readMessages(chatRoom: ChatRoomDocType) {
    //상대가 말한 메세지를 읽음처리
    const query1 = `
    UPDATE messages
    SET "isRead" = true
    WHERE "chatRoomId" = ${chatRoom.chatRoomId}
    AND "speakerId" = ${chatRoom.chatWithUserId}
    AND "isRead" = false;`;

    return this.client.query(query1);
  }
}

export const messageRepository = new MessageRepository(pgdb.client);
