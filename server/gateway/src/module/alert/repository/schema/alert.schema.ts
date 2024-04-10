import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AlertContentUnion } from 'sns-interfaces/alert.interface';
import { UserSchemaDefinition } from 'src/module/user/schema/user.schema';

export type AlertDocument = HydratedDocument<AlertSchemaDefinition>;

@Schema()
export class AlertSchemaDefinition {
  @Prop({ default: new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  userId: number;

  @Prop({ required: true, type: Object })
  content: AlertContentUnion;

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

export interface AlertSchemaExecPop extends AlertSchemaDefinition {
  userPop?: UserSchemaDefinition;
}
