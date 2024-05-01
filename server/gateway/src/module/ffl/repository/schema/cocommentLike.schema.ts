import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CocommentLikeDocument =
  HydratedDocument<CocommentLikeSchemaDefinition>;

@Schema()
export class CocommentLikeSchemaDefinition {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  userId: number;

  @Prop({ required: true, type: Number })
  cocommentId: number;
}

export const CocommentLikeSchema = SchemaFactory.createForClass(
  CocommentLikeSchemaDefinition,
);

CocommentLikeSchema.index({ userId: 1, cocommentId: 1 }, { unique: true });
