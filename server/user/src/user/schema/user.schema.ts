import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
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

export const UserSchema = SchemaFactory.createForClass(User);

// const newUserDoc: SnsUsersDocType = {
//   username: signUpDto.username,
//   introduce: '',
//   img: '',
//   introduceName: '',
// };
