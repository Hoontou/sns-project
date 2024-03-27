import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MetadataDocument = HydratedDocument<MetadataSchemaDefinition>;

@Schema()
export class MetadataSchemaDefinition {
  //밑에 _id선언은 없어도 되는데,
  // _id로 find해오는 쿼리를 쓰고싶으면 추가해야함
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
  userId: string;
  files: string[];
  createdAt: string;
}
