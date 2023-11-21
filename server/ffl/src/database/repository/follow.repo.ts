import mongoose from 'mongoose';
import { crypter } from '../../common/crypter';
import { cacheManager } from '../../common/userlist.cache.manager';
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

  /**팔로잉에서 사람검색 */
  async searchUserFollowing(data: {
    targetUser: string;
    searchString: string;
  }) {
    const type = 'following';
    const targetUserId = crypter.decrypt(data.targetUser);

    //캐시에서 가져온다
    const userList = cacheManager.getUserList({
      type,
      target: targetUserId,
      searchString: data.searchString,
    });

    if (userList === undefined) {
      console.log(`missing from ${type} container, loading requested`);

      //캐시에 없다면 디비에서 가져온다
      const tmpAllUserList = await this.db
        .find({ userFrom: targetUserId })
        .populate(UserToPopulate)
        .exec()
        .then((res) => {
          return res.map((item) => {
            return {
              ...item.getUserTo._doc,
            };
          });
        })
        .catch((err) => {
          console.log(err);
        });

      //가져온거 캐시에 등록
      cacheManager.loadUserList({
        type,
        userList: tmpAllUserList,
        target: targetUserId,
      });
      //prefix find 해서 리턴
      return findMatchingIndices(tmpAllUserList, data.searchString);
    }

    console.log('list is existed, no db request');
    return findMatchingIndices(userList, data.searchString);
  }

  /**팔로워에서 사람검색 */
  async searchUserFollower(data: { targetUser: string; searchString: string }) {
    const type = 'follower';
    const targetUserId = crypter.decrypt(data.targetUser);

    //캐시에서 가져온다
    const userList = cacheManager.getUserList({
      type,
      target: targetUserId,
      searchString: data.searchString,
    });

    if (userList === undefined) {
      console.log(`missing from ${type} container, loading requested`);

      //캐시에 없다면 디비에서 가져온다
      const tmpAllUserList = await this.db
        .find({ userTo: targetUserId })
        .populate(UserFromPopulate)
        .exec()
        .then((res) => {
          return res.map((item) => {
            return {
              ...item.getUserFrom._doc,
            };
          });
        })
        .catch((err) => {
          console.log(err);
        });

      //가져온거 캐시에 등록
      cacheManager.loadUserList({
        type,
        userList: tmpAllUserList,
        target: targetUserId,
      });
      //prefix find 해서 리턴
      return findMatchingIndices(tmpAllUserList, data.searchString);
    }
    console.log('list is existed, no db request');

    return findMatchingIndices(userList, data.searchString);
  }
}

/**인풋으로 온 리스트 돌면서 prefix로 매칭되는것만 리턴 */
export const findMatchingIndices = (
  userList: {
    username: string;
    introduceName: string;
    img: string;
  }[],
  prefix: string,
) => {
  const matchingIndices: {
    username: string;
    introduceName: string;
    img: string;
  }[] = [];

  for (let i = 0; i < userList.length; i++) {
    if (userList[i].username.startsWith(prefix)) {
      matchingIndices.push({
        username: userList[i].username,
        img: userList[i].img,
        introduceName: userList[i].introduceName,
      });
    }
  }

  return matchingIndices;
};

export const followRepository = new FollowRepository(Follow);
