import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserSchemaDefinition } from 'src/module/user/schema/user.schema';

export type FollowDocument = HydratedDocument<FollowSchemaDefinition>;

@Schema()
export class FollowSchemaDefinition {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  userTo: number;

  @Prop({ required: true, type: Number })
  userFrom: number;
}

export const FollowSchema = SchemaFactory.createForClass(
  FollowSchemaDefinition,
);

FollowSchema.index({
  userTo: 1,
  userFrom: 1,
});

export const UserToPop = 'userToPop';
export const UserFromPop = 'userFromPop';
FollowSchema.virtual(UserToPop, {
  ref: 'user',
  localField: 'userTo',
  foreignField: 'userId',
  justOne: true,
});
FollowSchema.virtual(UserFromPop, {
  ref: 'user',
  localField: 'userFrom',
  foreignField: 'userId',
  justOne: true,
});

export interface FollowSchemaDefinitionExecPop extends FollowSchemaDefinition {
  userToPop?: UserSchemaDefinition;
  userFromPop?: UserSchemaDefinition;
}
