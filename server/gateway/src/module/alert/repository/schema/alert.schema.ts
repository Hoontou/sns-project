import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AlertContentUnion } from 'sns-interfaces/alert.interface';

export type AlertDocument = HydratedDocument<AlertSchemaDefinition>;

@Schema()
export class AlertSchemaDefinition {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true, type: Object })
  content: object;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AlertSchema = SchemaFactory.createForClass(AlertSchemaDefinition);

AlertSchema.index({
  userId: 1,
});

AlertSchema.virtual('userPop', {
  ref: 'user',
  localField: 'content.userId',
  foreignField: 'userId',
  justOne: true,
});

export interface AlertSchemaType {
  _id?: string;
  userId: number;
  content: AlertContentUnion;
  createdAt: Date;
  read: boolean;
}
