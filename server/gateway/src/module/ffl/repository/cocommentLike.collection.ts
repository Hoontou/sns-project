import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import {
  CocommentLikeDocument,
  CocommentLikeSchemaDefinition,
} from './schema/cocommentLike.schema';

@Injectable()
export class CocommentLikeCollection {
  private logger = new Logger(CocommentLikeCollection.name);
  constructor(
    @InjectModel('cocommentlike')
    private cocommentLikeModel: Model<CocommentLikeDocument>,
  ) {}

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  async addCocommentLike(data: { userId: number; cocommentId: number }) {
    const newOne = new this.cocommentLikeModel({
      userId: crypter.decrypt(data.userId),
      cocommentId: data.cocommentId,
    });

    await newOne
      .save()
      .then(() => {
        this.logger.debug('cocomment like stored in mongo successfully');
      })
      .catch((err) => {
        this.logger.error('err when storing cocomment like in mongo');
        this.logger.error(err);
      });

    return;
  }

  async removeCocommentLike(data: { userId: number; cocommentId: number }) {
    await this.cocommentLikeModel
      .findOneAndDelete({
        userId: crypter.decrypt(data.userId),
        cocommentId: data.cocommentId,
      })
      .then(() => {
        this.logger.debug('cocomment like removed');
      })
      .catch((err) => {
        this.logger.error('err when canceling cocomment like in mongo');
        this.logger.error(err);
      });

    return;
  }

  getCocommentLikes(data: {
    cocommentIdList: number[];
    userId: number;
  }): Promise<CocommentLikeSchemaDefinition[]> {
    return this.cocommentLikeModel
      .find({
        cocommentId: { $in: data.cocommentIdList },
        userId: data.userId,
      })
      .sort({ cocommentId: -1 })
      .exec();
  }
}
