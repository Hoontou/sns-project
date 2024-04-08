import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AlertSchemaDefinition } from './schema/alert.schema';
import { AlertDto, UploadAlertDto } from 'sns-interfaces/alert.interface';
import { crypter } from '../../../common/crypter';

const pageLen = 20;

@Injectable()
export class AlertCollection {
  private logger = new Logger(AlertCollection.name);
  constructor(
    @InjectModel('alert')
    public readonly alertModel: Model<AlertSchemaDefinition>,
  ) {}

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  saveAlert(alertDto: AlertDto | UploadAlertDto) {
    const newOne = new this.alertModel({
      userId: alertDto.userId,
      content: alertDto.content,
    });

    newOne
      .save()
      .then(() => this.logger.error('alert stored in mongo successfully'))
      .catch((err) => {
        this.logger.error('err when storing alert in mongo');
        this.logger.error(err);
      });
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
    return newOne;
  }

  getAllAlerts(userId, page) {
    return this.alertModel
      .find({
        userId: Number(crypter.decrypt(userId)),
        read: false,
      })
      .populate('userPop')
      .skip(page * pageLen)
      .limit(pageLen)
      .sort({ _id: -1 });
  }

  getUnreadAlerts(userId, page) {
    return this.alertModel
      .find({
        userId: Number(crypter.decrypt(userId)),
      })
      .populate('userPop')
      .skip(page * pageLen)
      .limit(pageLen)
      .sort({ _id: -1 });
  }
}
