import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FollowDocument = HydratedDocument<FollowSchemaDefinition>;

@Schema()
export class FollowSchemaDefinition {
  @Prop({ required: true })
  userTo: number;

  @Prop({ required: true })
  userFrom: number;
}

export const FollowSchema = SchemaFactory.createForClass(
  FollowSchemaDefinition,
);

FollowSchema.index(
  {
    userTo: 1,
    userFrom: 1,
  },
  { unique: true },
);

export const UserToPopulate = 'getUserTo';
export const UserFromPopulate = 'getUserFrom';
FollowSchema.virtual(UserToPopulate, {
  ref: 'user', // 참조할 collections
  localField: 'userTo', // 현재 스키마에 선언되어 있는 참조할 필드
  foreignField: 'userId', // collections에서 참조할 필드
  justOne: true, // 하나만 반환하는지 여부
});
FollowSchema.virtual(UserFromPopulate, {
  ref: 'user', // 참조할 collections
  localField: 'userFrom', // 현재 스키마에 선언되어 있는 참조할 필드
  foreignField: 'userId', // collections에서 참조할 필드
  justOne: true, // 하나만 반환하는지 여부
});

export interface FollowSchemaType {
  userTo: number;
  userFrom: number;
}
