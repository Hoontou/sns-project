import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AlertSchemaDefinition } from './schema/alert.schema';
import { AlertDto, UploadAlertDto } from 'sns-interfaces/alert.interface';

@Injectable()
export class AlertCollection {
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
      .then(() => console.log('alert stored in mongo successfully'))
      .catch((err) => {
        console.log('err when storing alert in mongo');
        console.log(err);
      });
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
    return newOne;
  }
}
