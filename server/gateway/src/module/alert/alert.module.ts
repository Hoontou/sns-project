import { forwardRef, Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { AlertCollection } from './repository/alert.collection';
import { AlertSchema } from './repository/schema/alert.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageRepository } from '../direct/repository/message.repository';
import { UserModule } from '../user/user.module';
import { ClassSchema, RoomSchema } from './repository/schema/calss.schema';
import { ClassCollection } from './repository/class.repo';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'alert', schema: AlertSchema },
      { name: 'Class', schema: ClassSchema },
      { name: 'Room', schema: RoomSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [AlertController],
  providers: [
    AlertService,
    AlertCollection,
    MessageRepository,
    ClassCollection,
  ],
  exports: [AlertService],
})
export class AlertModule {}
