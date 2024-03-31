import { Injectable, Logger } from '@nestjs/common';
import { pgdb } from '../../../configs/postgres';
import { ChatRoomSchemaType } from './schema/chatRoom.schema';

export interface DirectMessage {
  id: number;
  chatRoomId: number;
  speakerId: number;
  messageType: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface ChatRoom {
  id: number;
  refCount: number;
}

@Injectable()
export class MessageRepository {
  private logger = new Logger(MessageRepository.name);
  private readonly pgClient;
  constructor() {
    this.pgClient = pgdb.client;
    this.createTables();
  }

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
        await this.pgClient.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting message:', error);
      throw error;
    }
  }

  async getMessages(chatRomId: number, startAt?: number) {
    const limit = 40;

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
      await this.pgClient.query(query);

    return result.rows;
  }

  readMessages(chatRoom: ChatRoomSchemaType) {
    //상대가 말한 메세지를 읽음처리
    const query1 = `
    UPDATE messages
    SET "isRead" = true
    WHERE "chatRoomId" = ${chatRoom.chatRoomId}
    AND "speakerId" = ${chatRoom.chatWithUserId}
    AND "isRead" = false;`;

    return this.pgClient.query(query1);
  }

  async createTables() {
    const query1 = `CREATE TABLE IF NOT EXISTS chatrooms (
      id SERIAL PRIMARY KEY,
      "refCount" integer DEFAULT 2
      );`;

    const query2 = `
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        "chatRoomId" INTEGER NOT NULL,
        "speakerId" INTEGER NOT NULL,
        "messageType" character varying NOT NULL,
        "content" character varying NOT NULL,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        
        CONSTRAINT fk_chatroom_id FOREIGN KEY ("chatRoomId") REFERENCES chatrooms(id) ON DELETE CASCADE,
        CONSTRAINT fk_speaker_id FOREIGN KEY ("speakerId") REFERENCES public.user(id)
        );`;

    try {
      await this.pgClient.query(query1);
      await this.pgClient.query(query2);
    } catch (error) {
      this.logger.error('err while create tables on dm server');
      this.logger.error(error);
    }
  }
}
