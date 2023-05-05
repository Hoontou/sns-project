import mongoose from 'mongoose';
import { crypter } from '../common/crypter';

const likeSchema = new mongoose.Schema({
  postId: String,
  userId: String,
});

//복합인덱스 2가지경우 모두 걸어준다.
//성능향상 기대할수 있음, 나중에 인덱스 싹다없애고 쿼리결과보는것도 재밌을듯?
likeSchema.index(
  {
    postId: 1,
    userId: 1,
  },
  { unique: true },
);
likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Like = mongoose.model('like', likeSchema);

class LikeRepository {
  constructor(public readonly db) {}
  //constructor(public readonly db) {connectMongo();}
  //스키마 다중연결을 고려해서 몽고연결은 index.ts에서

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  async addLike(data: { userId: string; postId: string }) {
    const newOne = await new Like({
      userId: crypter.decrypt(data.userId),
      postId: data.postId,
    });
    newOne
      .save()
      .then(() => {
        console.log('like stored in mongo successfully');
      })
      .catch(() => {
        console.log('err when storing like in mongo');
      });
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
    return newOne;
  }

  async removeLike(data: { userId: string; postId: string }) {
    this.db
      .findOneAndDelete({
        userId: crypter.decrypt(data.userId),
        postId: data.postId,
      })
      .then(() => {
        console.log('like canceled');
      })
      .catch(() => {
        console.log('err when canceling like in mongo');
      });
  }
}
export const likeRopository = new LikeRepository(Like);
