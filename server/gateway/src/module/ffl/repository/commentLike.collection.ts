import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import {
  CommentLikeDocument,
  CommentLikeSchemaDefinition,
} from './schema/commentLike.schema';

@Injectable()
export class CommentLikeCollection {
  private logger = new Logger(CommentLikeCollection.name);
  constructor(
    @InjectModel('commentlike')
    private commentLikeModel: Model<CommentLikeDocument>,
  ) {}

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  async addCommentLike(data: { userId: number; commentId: number }) {
    const newOne = new this.commentLikeModel({
      userId: crypter.decrypt(data.userId),
      commentId: data.commentId,
    });
    await newOne
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

  async removeCommentLike(data: { userId: number; commentId: number }) {
    await this.commentLikeModel
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

  async getCommentLiked(data: {
    commentIdList: number[];
    userId: number;
  }): Promise<CommentLikeSchemaDefinition[]> {
    //각각의 댓글에 좋아요 눌렀는지 체크
    return this.commentLikeModel
      .find({
        commentId: { $in: data.commentIdList },
        userId: data.userId,
      })
      .sort({ commentId: -1 })
      .exec();
  }
}
