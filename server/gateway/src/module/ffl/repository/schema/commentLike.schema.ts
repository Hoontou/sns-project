import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentLikeDocument = HydratedDocument<CommentLikeSchemaDefinition>;

@Schema()
export class CommentLikeSchemaDefinition {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  commentId: number;
}

export const CommentLikeSchema = SchemaFactory.createForClass(
  CommentLikeSchemaDefinition,
);

CommentLikeSchema.index(
  {
    commentId: 1,
    userId: 1,
  },
  { unique: true },
);
CommentLikeSchema.index({ userId: 1, commentId: 1 }, { unique: true });

export interface CommentLikeSchemaType {
  userId: string;
  commentId: number;
}
