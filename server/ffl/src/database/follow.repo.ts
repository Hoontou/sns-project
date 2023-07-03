import mongoose from 'mongoose';
import { crypter } from '../common/crypter';

const followSchema = new mongoose.Schema({
  userFrom: String,
  userTo: String,
});

//복합인덱스 2가지경우 모두 걸어준다.
//성능향상 기대할수 있음, 나중에 인덱스 싹다없애고 쿼리결과보는것도 재밌을듯?
followSchema.index(
  {
    userTo: 1,
    userFrom: 1,
  },
  { unique: true },
);
followSchema.index({ userFrom: 1, userTo: 1 }, { unique: true });

export const Follow = mongoose.model('follow', followSchema);

class FollowRepository {
  constructor(public readonly db) {}
  //constructor(public readonly db) {connectMongo();}
  //스키마 다중연결을 고려해서 몽고연결은 index.ts에서

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  addFollow(data: { userTo: string; userFrom: string }) {
    const newOne = new Follow({
      userTo: crypter.decrypt(data.userTo),
      userFrom: crypter.decrypt(data.userFrom),
    });
    return newOne
      .save()
      .then(() => {
        console.log('follow stored in mongo successfully');
      })
      .catch(() => {
        console.log('err when storing follow in mongo');
      });
  }

  removeFollow(data: { userTo: string; userFrom: string }) {
    return this.db
      .findOneAndDelete({
        userTo: crypter.decrypt(data.userTo),
        userFrom: crypter.decrypt(data.userFrom),
      })
      .then(() => {
        console.log('follow canceled');
      })
      .catch(() => {
        console.log('err when canceling follow in mongo');
      });
  }

  async getUserIds(
    userId: string,
    type: 'follower' | 'following',
  ): Promise<string[]> {
    const userIds = await this.db.find(
      type === 'follower' ? { userTo: userId } : { userFrom: userId },
    );
    return userIds.map((item) => {
      return type === 'follower' ? item.userFrom : item.userTo;
    });
  }
}
export const followRepository = new FollowRepository(Follow);
