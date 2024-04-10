import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MetadataDocument = HydratedDocument<MetadataSchemaDefinition>;

@Schema()
export class MetadataSchemaDefinition {
  @Prop({ default: new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  files: string[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MetadataSchema = SchemaFactory.createForClass(
  MetadataSchemaDefinition,
);

export interface MetadataSchemaType {
  _id: string;
  userId: string;
  files: string[];
  createdAt: string;
}
