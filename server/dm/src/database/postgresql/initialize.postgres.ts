import { Client } from 'pg';

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
}

export const pgdb = new Postgres();

// CREATE TABLE messages (
// 	id SERIAL PRIMARY KEY,
// 	"chatRoomId" character varying NOT NULL,
// 	"speakerId" INTEGER NOT NULL,
// 	"messageType" character varying NOT NULL,
// 	"content" character varying NOT NULL,
// 	"createdAt" timestamp without time zone NOT NULL DEFAULT now(),
// 	"isRead" BOOLEAN NOT NULL DEFAULT false,

// 	CONSTRAINT fk_chatroom_id FOREIGN KEY ("chatRoomId") REFERENCES chatrooms(id) ON DELETE CASCADE,
// 	CONSTRAINT fk_speaker_id FOREIGN KEY ("speakerId") REFERENCES public.user(id)
// );

// CREATE TABLE IF NOT EXISTS public.chatrooms
// (
// id character varying COLLATE pg_catalog."default" NOT NULL,
// "refCount" integer DEFAULT 2,
// CONSTRAINT chatrooms_pkey PRIMARY KEY (id)
// )
