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
  addCocommentLike(data: { userId: number; cocommentId: number }) {
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

  removeCocommentLike(data: { userId: number; cocommentId: number }) {
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

  async getCocommentLiked(data: { cocommentIdList: number[]; userId: number }) {
    const likedList: CocommentLikeSchemaDefinition[] =
      await this.cocommentLikeModel
        .find({
          cocommentId: { $in: data.cocommentIdList },
          userId: data.userId,
        })
        .sort({ cocommentId: -1 })
        .exec();

    if (likedList.length === 0) {
      return {
        cocommentLikedList: Array(data.cocommentIdList.length).fill(false),
      };
    }

    //투포인터로 밀고가면서 좋아요 체크결과 맞으면 true
    let tmpIndex: number = 0;
    const tmp = [...data.cocommentIdList].map((i) => {
      if (i === likedList[tmpIndex].cocommentId) {
        tmpIndex += 1;
        return true;
      }
      return false;
    });
    return { cocommentLikedList: tmp };

    //위는 제대로된 데이터만 들어온다면, index초과 오류는 안날거임.
    //아래는 훨씬 느린 대신 index초과 따윈 없을거임

    // console.log(data);
    // console.log(likedList);

    // const cocommentLikedList: boolean[] = Array(
    //   data.cocommentIdList.length,
    // ).fill(false);
    // for (const i of likedList) {
    //   cocommentLikedList[data.cocommentIdList.indexOf(i.cocommentId)] = true;
    // }

    // return { cocommentLikedList };
  }
}
