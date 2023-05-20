import mongoose from 'mongoose';
import { crypter } from '../common/crypter';

const commentLikeSchema = new mongoose.Schema({
  commentId: Number,
  userId: String,
});

//복합인덱스 2가지경우 모두 걸어준다.
//성능향상 기대할수 있음, 나중에 인덱스 싹다없애고 쿼리결과보는것도 재밌을듯?
commentLikeSchema.index(
  {
    commentId: 1,
    userId: 1,
  },
  { unique: true },
);
commentLikeSchema.index({ userId: 1, commentId: 1 }, { unique: true });

export const commentLike = mongoose.model('commentLike', commentLikeSchema);

class CommentLikeRepository {
  constructor(public readonly db) {}
  //constructor(public readonly db) {connectMongo();}
  //스키마 다중연결을 고려해서 몽고연결은 index.ts에서

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  async addCommentLike(data: { userId: string; commentId: number }) {
    const newOne = await new commentLike({
      userId: crypter.decrypt(data.userId),
      commentId: data.commentId,
    });
    newOne
      .save()
      .then(() => {
        console.log('comment like stored in mongo successfully');
      })
      .catch(() => {
        console.log('err when storing comment like in mongo');
      });
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
    return newOne;
  }

  async removeCommentLike(data: { userId: string; commentId: number }) {
    this.db
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
}
export const commentLikeRopository = new CommentLikeRepository(commentLike);
