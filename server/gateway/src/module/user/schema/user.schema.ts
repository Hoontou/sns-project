import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<UserSchemaDefinition>;

@Schema()
export class UserSchemaDefinition {
  @Prop({ default: new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  userId: number;

  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ default: '' })
  introduce: string;

  @Prop({ default: '' })
  introduceName: string;

  @Prop({ default: '' })
  img: string;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaDefinition);

// export interface UserSchemaType {
//   _id: Types.ObjectId;
//   userId: number;
//   username: string;
//   introduce: string;
//   introduceName: string;
//   img: string;
// }
