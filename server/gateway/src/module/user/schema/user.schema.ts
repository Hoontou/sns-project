import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserSchemaDefinition>;

@Schema()
export class UserSchemaDefinition {
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

export interface UserSchemaType {
  userId: number;
  username: string;
  introduce: string;
  introduceName: string;
  img: string;
}
