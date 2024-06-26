import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  emptyUser,
  UserSchemaDefinition,
} from '../../../user/schema/user.schema';

export const emptyChatRoom: Readonly<ChatRoomSchemaDefinitionExecPop> = {
  _id: new Types.ObjectId(),
  chatRoomId: 0,
  lastTalk: '',
  lastUpdatedAt: new Date(),
  ownerUserId: 0,
  chatWithUserId: 0,
  newChatCount: 0,
  totalChatCount: 0,
  userPop: emptyUser,
};

export type ChatRoomDocument = HydratedDocument<ChatRoomSchemaDefinition>;

@Schema()
export class ChatRoomSchemaDefinition {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  chatRoomId: number;

  @Prop({ default: '', type: String })
  lastTalk: string;

  @Prop({ default: Date.now, type: Date })
  lastUpdatedAt: Date;

  @Prop({ required: true, type: Number })
  ownerUserId: number;

  @Prop({ required: true, type: Number })
  chatWithUserId: number;

  @Prop({ default: 0, type: Number })
  newChatCount: number;

  @Prop({ default: 0, type: Number })
  totalChatCount: number;
}

export const ChatRoomSchema = SchemaFactory.createForClass(
  ChatRoomSchemaDefinition,
);

export const UserPop = 'userPop';

ChatRoomSchema.virtual(UserPop, {
  ref: 'user',
  localField: 'chatWithUserId',
  foreignField: 'userId',
  justOne: true,
});

export interface ChatRoomSchemaDefinitionExecPop
  extends ChatRoomSchemaDefinition {
  userPop?: UserSchemaDefinition;
}
