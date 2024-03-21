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
  totalChatCount: number;
  userPop?: {
    _id: string;
    userId: number;
    username: string;
    introduce: string;
    introduceName: string;
    img: string;
  };
}

export const emptyChatRoom: ChatRoomDocType = {
  chatRoomId: 0,
  lastTalk: '',
  lastUpdatedAt: new Date(),
  ownerUserId: 0,
  chatWithUserId: 0,
  newChatCount: 0,
  totalChatCount: 0,
};

// export interface ChatRoomWithUserPop extends ChatRoomDocType {
//   chatWithUserInfo: {
//     _id: string;
//     userId: number;
//     username: string;
//     introduce: string;
//     introduceName: string;
//     img: string;
//   };
// }

const chatRoomSchema = new mongoose.Schema({
  chatRoomId: { type: Number, required: true },
  lastTalk: { type: String, default: '' },
  lastUpdatedAt: { type: Date, default: Date.now },
  ownerUserId: { type: Number, required: true },
  chatWithUserId: { type: Number, required: true },
  newChatCount: { type: Number, default: 0 },
  totalChatCount: { type: Number, default: 0 },
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
    return this.db
      .findOne({
        ownerUserId: data.ownerUserId,
        chatRoomId: data.chatRoomId,
      })
      .populate('userPop')
      .exec();
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

  async updateChatRoomAndReturn(data: {
    chatRoom: ChatRoomDocType;
    messageForm: { messageType: 'text' | 'photo'; content: string };
    isRead: boolean;
  }) {
    const lastUpdatedAt = Date.now();
    //내 챗룸에서
    //마지막말, 마지막 업데이트, 토탈 챗 갯수
    //상대 챗룸에서
    //마지막말, 마지막 업데이트, 토탈 챗 갯수, 안읽은 챗 갯수
    //만약 상대는 챗룸에서 나갔다면? 새로 챗룸만들어야함, 아직은 추가안했음
    //챗룸나가기 구현 하면서 만들기

    const [myChatRoom, friendsChatRoom] = await Promise.all([
      this.db
        .findOneAndUpdate(
          {
            _id: data.chatRoom._id,
          },
          {
            lastTalk:
              data.messageForm.messageType === 'photo'
                ? '사진'
                : data.messageForm.content,
            //몽고디비 자체 함수가있는데 몽고디비랑 서버랑 시간이 안맞을수도 있어서
            lastUpdatedAt,
            $inc: { totalChatCount: 1 },
          },
          { new: true },
        )
        .exec(),
      this.db
        .findOneAndUpdate(
          {
            ownerUserId: data.chatRoom.chatWithUserId,
            chatWithUserId: data.chatRoom.ownerUserId,
          },
          {
            lastTalk:
              data.messageForm.messageType === 'photo'
                ? '사진'
                : data.messageForm.content,
            //몽고디비 자체 함수가있는데 몽고디비랑 서버랑 시간이 안맞을수도 있어서
            lastUpdatedAt,
            $inc: {
              newChatCount: data.isRead === true ? 0 : 1,
              totalChatCount: 1,
            },
          },
          { new: true },
        )
        .populate('userPop')
        .exec(),
    ]);
    return { myChatRoom, friendsChatRoom };
  }

  getChatRoomsByUserIdWithUserPop(userId: number, page: number) {
    const size = 12;
    return this.db
      .find({ ownerUserId: userId })
      .populate('userPop')
      .sort({ lastUpdatedAt: -1 })
      .skip(page * size)
      .limit(size)
      .exec();
  }
}
export const chatRoomRepository = new ChatRoomRepository(ChatRoomModel);
