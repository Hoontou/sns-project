import { Client } from 'pg';

export interface Message {
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

class Postgres {
  public readonly client;
  constructor() {
    this.client = new Client({
      host: 'pgdb',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
    });
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
      await this.client.query(query1);
      await this.client.query(query2);
    } catch (error) {
      console.log('err while create tables on dm server');
      console.log(error);
    }
  }

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

export const pgdb = new Postgres();
