import mongoose from 'mongoose';
import { pgdb } from './connect.config/initialize.postgres';

export interface ChatRoomDocType {
  _id?: string;
  chatRoomId: number;
  lastTalk: string;
  lastUpdatedAt: Date;
  ownerUserId: number;
  chatWithUserId: number;
  newChatCount: number;
}

const chatRoomSchema = new mongoose.Schema({
  chatRoomId: { type: Number, required: true },
  lastTalk: { type: String, default: '' },
  lastUpdatedAt: { type: Date, default: Date.now },
  ownerUserId: { type: Number, required: true },
  chatWithUserId: { type: Number, required: true },
  newChatCount: { type: Number, default: 0 },
});

chatRoomSchema.index({ chatRoomId: 1 });
chatRoomSchema.index({ ownerUserId: 1, chatWithUserId: 1 });

chatRoomSchema.virtual('userPop', {
  ref: 'user', // 참조할 collections
  localField: 'chatWithUserId', // 현재 스키마에 선언되어 있는 참조할 필드
  foreignField: 'userId', // collections에서 참조할 필드
  justOne: true, // 하나만 반환하는지 여부
});

const ChatRoomModel = mongoose.model('chatRoom', chatRoomSchema);

export class ChatRoomRepository {
  constructor(public readonly db: mongoose.Model<ChatRoomDocType>) {}

  async getChatRoomByUserIds(data: {
    ownerUserId: number;
    chatWithUserId: number;
  }) {
    return this.db.findOne({
      ownerUserId: data.ownerUserId,
      chatWithUserId: data.chatWithUserId,
    });
  }
  async getChatRoomByRoomId(data: { ownerUserId: number; chatRoomId: number }) {
    return this.db.findOne({
      ownerUserId: data.ownerUserId,
      chatRoomId: data.chatRoomId,
    });
  }

  async createChatRoom(data: {
    ownerUserId: number;
    chatWithUserId: number;
  }): Promise<number> {
    const insertResult = await pgdb.client.query(
      'INSERT INTO chatrooms DEFAULT VALUES RETURNING *;',
    );

    const newChatRoomId = insertResult.rows[0].id;

    await this.db.create([
      {
        chatRoomId: newChatRoomId,
        ownerUserId: data.ownerUserId,
        chatWithUserId: data.chatWithUserId,
      },
      {
        chatRoomId: newChatRoomId,
        ownerUserId: data.chatWithUserId,
        chatWithUserId: data.ownerUserId,
      },
    ]);

    return newChatRoomId;
  }
}
export const chatRoomRepository = new ChatRoomRepository(ChatRoomModel);
