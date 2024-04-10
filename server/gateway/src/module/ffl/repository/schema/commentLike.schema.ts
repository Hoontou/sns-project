import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentLikeDocument = HydratedDocument<CommentLikeSchemaDefinition>;

@Schema()
export class CommentLikeSchemaDefinition {
  @Prop({ default: new Types.ObjectId() })
  _id: Types.ObjectId;

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
