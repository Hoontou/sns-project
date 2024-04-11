import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import { CocommentLikeDocument } from './schema/cocommentLike.schema';

@Injectable()
export class CocommentLikeCollection {
  private logger = new Logger(CocommentLikeCollection.name);
  constructor(
    @InjectModel('cocommentlike')
    private cocommentLikeModel: Model<CocommentLikeDocument>,
  ) {}

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  addCocommentLike(data: { userId: string; cocommentId: number }) {
    const newOne = new this.cocommentLikeModel({
      userId: crypter.decrypt(data.userId),
      cocommentId: data.cocommentId,
    });

    newOne
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

  removeCocommentLike(data: { userId: string; cocommentId: number }) {
    this.cocommentLikeModel
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

  async getCocommentLiked(data: { cocommentIdList: number[]; userId: string }) {
    const likedList = await this.cocommentLikeModel
      .find({
        cocommentId: { $in: data.cocommentIdList },
        userId: Number(crypter.decrypt(data.userId)),
      })
      .exec();

    const cocommentLikedList = Array(data.cocommentIdList.length).fill(false);
    for (const i of likedList) {
      cocommentLikedList[data.cocommentIdList.indexOf(i.cocommentId)] = true;
    }

    return { cocommentLikedList };
  }
}
