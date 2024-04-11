import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MetadataDocument = HydratedDocument<MetadataSchemaDefinition>;

@Schema()
export class MetadataSchemaDefinition {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  userId: number;

  @Prop({ required: true, type: [String] })
  files: string[];

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;
}

export const MetadataSchema = SchemaFactory.createForClass(
  MetadataSchemaDefinition,
);
