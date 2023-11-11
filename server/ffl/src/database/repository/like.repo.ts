import mongoose from 'mongoose';
import { crypter } from '../../common/crypter';
import { findMatchingIndices } from './follow.repo';

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

likeSchema.virtual('getUserId', {
  ref: 'user', // 참조할 collections
  localField: 'userId', // 현재 스키마에 선언되어 있는 참조할 필드
  foreignField: 'userId', // collections에서 참조할 필드
  justOne: true, // 하나만 반환하는지 여부
});

export const Like = mongoose.model('like', likeSchema);

class LikeRepository {
  constructor(public readonly db) {}
  //constructor(public readonly db) {connectMongo();}
  //스키마 다중연결을 고려해서 몽고연결은 index.ts에서

  /**Dto파싱해서 document로 만들어 저장까지 해주는 함수. */
  addLike(data: { userId: string; postId: string }) {
    const newOne = new Like({
      userId: crypter.decrypt(data.userId),
      postId: data.postId,
    });
    return newOne
      .save()
      .then(() => {
        console.log('like stored in mongo successfully');
      })
      .catch(() => {
        console.log('err when storing like in mongo');
      });
  }

  removeLike(data: { userId: string; postId: string }) {
    return this.db
      .findOneAndDelete({
        userId: crypter.decrypt(data.userId),
        postId: data.postId,
      })
      .then(() => {
        console.log('like removed');
      })
      .catch(() => {
        console.log('err when canceling like in mongo');
      });
  }

  async getUserIds(postId: string, page: number): Promise<string[]> {
    const pageLen = 15;
    const userIds =
      page === -1
        ? await this.db.find({ postId })
        : await this.db
            .find({ postId })
            .skip(page * pageLen)
            .limit(pageLen)
            .exec();

    return userIds.map((item) => {
      return item.userId;
    });
  }

  /**좋아요에서 사람검색 */
  async searchUserLike(data: { targetPostId: string; searchString: string }) {
    const allUserList = await this.db
      .find({ postId: data.targetPostId })
      .populate('getUserId')
      .exec()
      .then((res) => {
        return res.map((item) => {
          return {
            ...item.getUserId._doc,
          };
        });
      })
      .catch((err) => {
        console.log(err);
      });

    const matchedUserList = findMatchingIndices(allUserList, data.searchString);

    return matchedUserList;
  }
}
export const likeRopository = new LikeRepository(Like);
