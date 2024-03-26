import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CocommentLikeDocument =
  HydratedDocument<CocommentLikeSchemaDefinition>;

@Schema()
export class CocommentLikeSchemaDefinition {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  cocommentId: number;
}

export const CocommentLikeSchema = SchemaFactory.createForClass(
  CocommentLikeSchemaDefinition,
);

CocommentLikeSchema.index(
  {
    cocommentId: 1,
    userId: 1,
  },
  { unique: true },
);
CocommentLikeSchema.index({ userId: 1, cocommentId: 1 }, { unique: true });

export interface CocommentLikeSchemaType {
  userId: string;
  cocommentId: number;
}
