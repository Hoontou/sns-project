import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  AlertDocument,
  AlertSchemaDefinition,
  AlertSchemaDefinitionExecPop,
} from './schema/alert.schema';
import { AlertDto, UploadAlertDto } from 'sns-interfaces/alert.interface';

const pageLen = 20;

@Injectable()
export class AlertCollection {
  private logger = new Logger(AlertCollection.name);
  constructor(
    @InjectModel('alert')
    public readonly alertModel: Model<AlertDocument>,
  ) {}

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  saveAlert(
    alertDto: AlertDto | UploadAlertDto,
  ): Promise<AlertSchemaDefinition> {
    const newOne = new this.alertModel({
      userId: Number(alertDto.userId),
      content: alertDto.content,
    });

    return newOne
      .save()
      .then((res) => {
        this.logger.debug('alert stored in mongo successfully');
        return res;
      })
      .catch((err) => {
        this.logger.error('err when storing alert in mongo');
        throw new Error(err);
      });
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
  }

  getAllAlerts(
    userId: number,
    page: number,
  ): Promise<AlertSchemaDefinitionExecPop[]> {
    return this.alertModel
      .find({
        userId: userId,
      })
      .populate('userPop')
      .skip(page * pageLen)
      .limit(pageLen)
      .sort({ _id: -1 })
      .lean();
  }

  getUnreadAlerts(
    userId: number,
    page: number,
  ): Promise<AlertSchemaDefinitionExecPop[]> {
    return this.alertModel
      .find({
        userId: userId,
        read: false,
      })
      .populate('userPop')
      .skip(page * pageLen)
      .limit(pageLen)
      .sort({ _id: -1 })
      .lean();
  }

  getLastUnreadAlert(userId: number): Promise<AlertSchemaDefinition | null> {
    return this.alertModel
      .findOne({
        userId: userId,
        read: false,
      })
      .sort({ _id: -1 })
      .exec();
  }
}
