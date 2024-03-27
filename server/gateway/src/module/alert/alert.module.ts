import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { AlertCollection } from './repository/alert.collection';
import { AlertSchema } from './repository/schema/alert.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageRepository } from '../direct/repository/message.repository';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'alert', schema: AlertSchema }]),
  ],
  controllers: [AlertController],
  providers: [AlertService, AlertCollection, MessageRepository],
  exports: [AlertService],
})
export class AlertModule {}
