import mongoose from 'mongoose';

interface ChatRoomDocType {
  _id?: string;
  chatRoomId: string;
  lastTalk: string;
  lastUpdatedAt: Date;
  user1Id: number;
  user2Id: number;
  user1NewChatCount: number;
  user2NewChatCount: number;
}

const chatRoomSchema = new mongoose.Schema({
  chatRoomId: { type: String, required: true },
  lastTalk: { type: String, required: true },
  lastUpdatedAt: { type: Date, required: true },
  user1Id: { type: Number, required: true },
  user2Id: { type: Number, required: true },
  user1NewChatCount: { type: Number, required: true },
  user2NewChatCount: { type: Number, required: true },
});

chatRoomSchema.index({ chatRoomId: 1 });
chatRoomSchema.index({ user1Id: 1, user2Id: 1 });

//근데 pop 할 때 마다 user1 또는 user2에 항상 내 id가 있을텐데,
//매번 내 정보를 중복해서 찾게되는 낭비가 생긴다.
//그냥 pop 하지말고, chatRoom 다 가져온 후 타인의 id만을 뽑아서 따로 find를 하는게
//나을거 같기도.
chatRoomSchema.virtual('user1Pop', {
  ref: 'user', // 참조할 collections
  localField: 'user1Id', // 현재 스키마에 선언되어 있는 참조할 필드
  foreignField: 'userId', // collections에서 참조할 필드
  justOne: true, // 하나만 반환하는지 여부
});
chatRoomSchema.virtual('userPop', {
  ref: 'user', // 참조할 collections
  localField: 'user2Id', // 현재 스키마에 선언되어 있는 참조할 필드
  foreignField: 'userId', // collections에서 참조할 필드
  justOne: true, // 하나만 반환하는지 여부
});

const ChatRoomModel = mongoose.model('chatRoom', chatRoomSchema);

export class ChatRoomRepository {
  constructor(public readonly db: mongoose.Model<ChatRoomDocType>) {}
}
export const alertRepository = new ChatRoomRepository(ChatRoomModel);
