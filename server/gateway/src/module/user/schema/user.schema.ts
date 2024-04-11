import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<UserSchemaDefinition>;

@Schema()
export class UserSchemaDefinition {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true, type: Number })
  userId: number;

  @Prop({ required: true, unique: true, index: true, type: String })
  username: string;

  @Prop({ default: '', type: String })
  introduce: string;

  @Prop({ default: '', type: String })
  introduceName: string;

  @Prop({ default: '', type: String })
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
