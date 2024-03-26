import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import { CocommentLikeSchemaDefinition } from './schema/cocommentLike.schema';

@Injectable()
export class CocommentLikeCollection {
  constructor(
    @InjectModel('cocommentlike')
    private cocommentLikeModel: Model<CocommentLikeSchemaDefinition>,
  ) {}

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  addCocommentLike(data: { userId: string; cocommentId: number }) {
    const newOne = new this.cocommentLikeModel({
      userId: crypter.decrypt(data.userId),
      cocommentId: data.cocommentId,
    });

    return newOne
      .save()
      .then(() => {
        console.log('cocomment like stored in mongo successfully');
      })
      .catch(() => {
        console.log('err when storing cocomment like in mongo');
      });
  }

  removeCocommentLike(data: { userId: string; cocommentId: number }) {
    return this.cocommentLikeModel
      .findOneAndDelete({
        userId: crypter.decrypt(data.userId),
        cocommentId: data.cocommentId,
      })
      .then(() => {
        console.log('cocomment like removed');
      })
      .catch(() => {
        console.log('err when canceling cocomment like in mongo');
      });
  }

  async getCocommentLiked(data: { cocommentIdList: number[]; userId: string }) {
    const likedList = await this.cocommentLikeModel
      .find({
        cocommentId: { $in: data.cocommentIdList },
        userId: `${crypter.decrypt(data.userId)}`,
      })
      .exec();

    const cocommentLikedList = Array(data.cocommentIdList.length).fill(false);
    for (const i of likedList) {
      cocommentLikedList[data.cocommentIdList.indexOf(i.cocommentId)] = true;
    }

    return { cocommentLikedList };
  }
}
