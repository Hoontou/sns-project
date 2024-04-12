import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import { CommentLikeDocument } from './schema/commentLike.schema';

@Injectable()
export class CommentLikeCollection {
  private logger = new Logger(CommentLikeCollection.name);
  constructor(
    @InjectModel('commentlike')
    private commentLikeModel: Model<CommentLikeDocument>,
  ) {}

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  addCommentLike(data: { userId: number; commentId: number }) {
    const newOne = new this.commentLikeModel({
      userId: crypter.decrypt(data.userId),
      commentId: data.commentId,
    });
    newOne
      .save()
      .then(() => {
        // this.logger.debug('comment like stored in mongo successfully');
      })
      .catch(() => {
        this.logger.error('err when storing comment like in mongo');
      });
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.

    return;
  }

  removeCommentLike(data: { userId: number; commentId: number }) {
    this.commentLikeModel
      .findOneAndDelete({
        userId: crypter.decrypt(data.userId),
        commentId: data.commentId,
      })
      .then(() => {
        // this.logger.debug('comment like removed');
      })
      .catch(() => {
        this.logger.error('err when canceling comment like in mongo');
      });
    return;
  }

  async getCommentLiked(data: { commentIdList: number[]; userId: number }) {
    //각각의 댓글에 좋아요 눌렀는지 체크
    const likedList = await this.commentLikeModel
      .find({
        commentId: { $in: data.commentIdList },
        userId: data.userId,
      })
      .sort({ commentId: -1 })
      .exec();

    if (likedList.length === 0) {
      return {
        commentLikedList: Array(data.commentIdList.length).fill(false),
      };
    }

    //투포인터로 밀고가면서 좋아요 체크결과 맞으면 true
    let tmpIndex: number = 0;
    const tmp = [...data.commentIdList].map((i) => {
      if (i === likedList[tmpIndex].commentId) {
        tmpIndex += 1;
        return true;
      }
      return false;
    });
    return { commentLikedList: tmp };

    // //false를 갯수만큼 채우고
    // const commentLikedList = Array(data.commentIdList.length).fill(false);

    // //item이 존재한다면 true로 변경
    // for (const i of likedList) {
    //   commentLikedList[data.commentIdList.indexOf(i.commentId)] = true;
    // }

    // return {
    //   commentLikedList,
    // };
  }
}
