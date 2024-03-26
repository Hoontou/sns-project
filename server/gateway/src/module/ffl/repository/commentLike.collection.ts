import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import { CommentLikeSchemaDefinition } from './schema/commentLike.schema';

@Injectable()
export class CommentLikeCollection {
  constructor(
    @InjectModel('commentlike')
    private commentLikeModel: Model<CommentLikeSchemaDefinition>,
  ) {}

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  addCommentLike(data: { userId: string; commentId: number }) {
    const newOne = new this.commentLikeModel({
      userId: crypter.decrypt(data.userId),
      commentId: data.commentId,
    });
    return newOne
      .save()
      .then(() => {
        console.log('comment like stored in mongo successfully');
      })
      .catch(() => {
        console.log('err when storing comment like in mongo');
      });
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
  }

  removeCommentLike(data: { userId: string; commentId: number }) {
    return this.commentLikeModel
      .findOneAndDelete({
        userId: crypter.decrypt(data.userId),
        commentId: data.commentId,
      })
      .then(() => {
        console.log('comment like removed');
      })
      .catch(() => {
        console.log('err when canceling comment like in mongo');
      });
  }

  async getCommentLiked(data: { commentIdList: number[]; userId: string }) {
    //각각의 댓글에 좋아요 눌렀는지 체크
    const likedList = await this.commentLikeModel
      .find({
        commentId: { $in: data.commentIdList },
        userId: `${crypter.decrypt(data.userId)}`,
      })
      .exec();

    //false를 갯수만큼 채우고
    const commentLikedList = Array(data.commentIdList.length).fill(false);

    //item이 존재한다면 true로 변경
    for (const i of likedList) {
      commentLikedList[data.commentIdList.indexOf(i.commentId)] = true;
    }

    return {
      commentLikedList,
    };
  }
}
