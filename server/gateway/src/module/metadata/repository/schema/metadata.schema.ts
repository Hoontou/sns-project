import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MetadataDocument = HydratedDocument<MetadataSchemaDefinition>;

@Schema()
export class MetadataSchemaDefinition {
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
  userId: string;
  files: string[];
  createdAt: string;
}
