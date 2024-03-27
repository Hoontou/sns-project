import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export interface ChatRoomSchemaType {
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

export const emptyChatRoom: ChatRoomSchemaType = {
  chatRoomId: 0,
  lastTalk: '',
  lastUpdatedAt: new Date(),
  ownerUserId: 0,
  chatWithUserId: 0,
  newChatCount: 0,
  totalChatCount: 0,
};

export type ChatRoomDocument = HydratedDocument<ChatRoomSchemaDefinition>;

@Schema()
export class ChatRoomSchemaDefinition {
  @Prop({ required: true })
  chatRoomId: number;

  @Prop({ default: '' })
  lastTalk: string;

  @Prop({ default: Date.now })
  lastUpdatedAt: Date;

  @Prop({ required: true })
  ownerUserId: number;

  @Prop({ required: true })
  chatWithUserId: number;

  @Prop({ default: 0 })
  newChatCount: number;

  @Prop({ default: 0 })
  totalChatCount: number;
}

export const ChatRoomSchema = SchemaFactory.createForClass(
  ChatRoomSchemaDefinition,
);

ChatRoomSchema.index({ chatRoomId: 1 });
ChatRoomSchema.index({ ownerUserId: 1, chatWithUserId: 1 });

ChatRoomSchema.virtual('userPop', {
  ref: 'user',
  localField: 'chatWithUserId',
  foreignField: 'userId',
  justOne: true,
});
