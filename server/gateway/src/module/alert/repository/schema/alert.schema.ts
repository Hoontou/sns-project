import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AlertContentUnion } from 'sns-interfaces/alert.interface';
import { UserSchemaDefinition } from 'src/module/user/schema/user.schema';

export type AlertDocument = HydratedDocument<AlertSchemaDefinition>;

//지금 좀 모호하다.
//userId가 아닌 owenerId
//content안의 userId를 밖으로 빼내서 누가보낸 알림인지 표시하는게 맞다..
@Schema()
export class AlertSchemaDefinition {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Number })
  userId: number;

  @Prop({ required: true, type: Object })
  content: AlertContentUnion;

  @Prop({ default: false, type: Boolean })
  read: boolean;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;
}

export const AlertSchema = SchemaFactory.createForClass(AlertSchemaDefinition);

AlertSchema.virtual('userPop', {
  ref: 'user',
  localField: 'content.userId',
  foreignField: 'userId',
  justOne: true,
});

export interface AlertSchemaDefinitionExecPop extends AlertSchemaDefinition {
  userPop?: UserSchemaDefinition;
}
