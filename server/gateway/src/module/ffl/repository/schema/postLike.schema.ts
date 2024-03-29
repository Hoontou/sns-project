import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostLikeDocument = HydratedDocument<PostLikeSchemaDefinition>;

@Schema()
export class PostLikeSchemaDefinition {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  postId: string;
}

export const PostLikeSchema = SchemaFactory.createForClass(
  PostLikeSchemaDefinition,
);

PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

PostLikeSchema.virtual('getUserId', {
  ref: 'user',
  localField: 'userId',
  foreignField: 'userId',
  justOne: true,
});

PostLikeSchema.virtual('getMetadata', {
  ref: 'metadata',
  localField: 'postId',
  foreignField: '_id',
  justOne: true,
});

export interface PostLikeSchemaType {
  userId: string;
  postId: string;
}
