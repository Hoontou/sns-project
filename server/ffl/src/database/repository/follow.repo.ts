import mongoose from 'mongoose';
import { crypter } from '../../common/crypter';
// user 서버의 user.schema.ts의 코드, ref설정위해 가져왔음
const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  introduce: {
    type: String,
    default: '',
  },
  introduceName: {
    type: String,
    default: '',
  },
  img: {
    type: String,
    default: '',
  },
});

export interface UserSchemaType {
  userId: number;
  username: string;
  introduce: string;
  introduceName: string;
  img: string;
}

//여기까지-------------------------------------------------

export const UserModel = mongoose.model('user', userSchema);

const followSchema = new mongoose.Schema({
  userFrom: Number,
  userTo: Number,
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

//참조키 거는거 참고한 블로그
//https://cocook.tistory.com/189
export const UserToPopulate = 'getUserTo';
export const UserFromPopulate = 'getUserFrom';
followSchema.virtual(UserToPopulate, {
  ref: 'user', // 참조할 collections
  localField: 'userTo', // 현재 스키마에 선언되어 있는 참조할 필드
  foreignField: 'userId', // collections에서 참조할 필드
  justOne: true, // 하나만 반환하는지 여부
});
followSchema.virtual(UserFromPopulate, {
  ref: 'user', // 참조할 collections
  localField: 'userFrom', // 현재 스키마에 선언되어 있는 참조할 필드
  foreignField: 'userId', // collections에서 참조할 필드
  justOne: true, // 하나만 반환하는지 여부
});

export const Follow = mongoose.model('follow', followSchema);

class FollowRepository {
  constructor(public readonly db) {
    // this.tstPopulate();
  }
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
    page: number,
  ): Promise<string[]> {
    const pageLen = 15;
    const userIds =
      page === -1
        ? await this.db.find(
            type === 'follower' ? { userTo: userId } : { userFrom: userId },
          )
        : await this.db
            .find(
              type === 'follower' ? { userTo: userId } : { userFrom: userId },
            )
            .skip(page * pageLen)
            .limit(pageLen)
            .exec();

    return userIds.map((item) => {
      return type === 'follower' ? item.userFrom : item.userTo;
    });
  }

  // 아래는 참조키로 가져오기 되는지 테스트한 코드,
  //근데 이 방식이 처음 할때 싹다긁어오는지, 아니면 접근시 긁어오는지,
  //그러니까 typeorm에서의 eager방식인지 아닌지 모르겠다 지금.
  //여러개 팔로우 만들어서 테스트 해봐야함
  //eager방식으로 싹다긁어온다.
  async tstPopulate() {
    this.db
      .find({ userFrom: 1 })
      .populate(UserToPopulate)
      .exec()
      .then((res) => {
        const result = res.map((item) => {
          return { ...item._doc, userTo: item.getUserTo };
        });
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
export const followRepository = new FollowRepository(Follow);
