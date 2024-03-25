// import mongoose from 'mongoose';

// export const userSchema = new mongoose.Schema({
//   userId: {
//     type: Number,
//     required: true,
//     unique: true,
//     index: true,
//   },
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true,
//   },
//   introduce: {
//     type: String,
//     default: '',
//   },
//   introduceName: {
//     type: String,
//     default: '',
//   },
//   img: {
//     type: String,
//     default: '',
//   },
// });

// export interface UserSchemaType {
//   userId: number;
//   username: string;
//   introduce: string;
//   introduceName: string;
//   img: string;
// }

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

export interface UserSchemaType {
  userId: number;
  username: string;
  introduce: string;
  introduceName: string;
  img: string;
}
