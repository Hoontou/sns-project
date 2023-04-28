import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  userFrom: String,
  userTo: String,
});

//복합인덱스 2가지경우 모두 걸어준다.
//성능향상 기대할수 있음, 나중에 인덱스 싹다없애고 쿼리결과보는것도 재밌을듯?
followSchema.index(
  {
    userId: 1,
    userFrom: 1,
  },
  { unique: true },
);
followSchema.index({ userFrom: 1, userId: 1 }, { unique: true });

export const Follow = mongoose.model('follow', followSchema);

class FollowRepository {
  constructor(public readonly db) {}
  //constructor(public readonly db) {connectMongo();}
  //스키마 다중연결을 고려해서 몽고연결은 index.ts에서

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  async addFollow(data: { userTo: string; userFrom: string }) {
    const newOne = await new Follow(data);
    newOne
      .save()
      .then(() => {
        console.log(`content: ${data}`);
        console.log('follow stored in mongo successfully');
      })
      .catch(() => console.log('err when storing follow in mongo'));
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
    return newOne;
  }
}
export const followRepository = new FollowRepository(Follow);
