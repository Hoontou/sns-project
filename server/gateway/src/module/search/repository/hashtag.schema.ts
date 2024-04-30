import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type HashtagDocument = HydratedDocument<HashtagSchemaDefinition>;

@Schema()
export class HashtagSchemaDefinition {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, type: String })
  tagName: string;

  @Prop({ default: 1, type: Number })
  count: number;
}

export const HashtagSchema = SchemaFactory.createForClass(
  HashtagSchemaDefinition,
);

HashtagSchema.index({ tagName: 1 });

export interface HashtagDocType {
  _id?: Types.ObjectId;
  tagName: string;
  count: number;
}
