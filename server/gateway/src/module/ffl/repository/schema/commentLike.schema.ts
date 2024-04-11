import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentLikeDocument = HydratedDocument<CommentLikeSchemaDefinition>;

@Schema()
export class CommentLikeSchemaDefinition {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  userId: number;

  @Prop({ required: true, type: Number })
  commentId: number;
}

export const CommentLikeSchema = SchemaFactory.createForClass(
  CommentLikeSchemaDefinition,
);
CommentLikeSchema.index({ userId: 1, commentId: 1 }, { unique: true });
