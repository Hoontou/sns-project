import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import {
  FollowSchemaDefinition,
  UserFromPopulate,
  UserToPopulate,
} from './schema/follow.schema';
import { cacheManager, userinfo } from '../common/userlist.cache.manager';

@Injectable()
export class FollowCollection {
  constructor(
    @InjectModel('follow')
    private followModel: Model<FollowSchemaDefinition>,
  ) {}

  async checkFollowed(data: { userTo: string; userFrom: string }) {
    //myId가 userId를 팔로우했는지 가져와야함.
    //userFrom: myId, userTo: userId
    const decUserTo = crypter.decrypt(data.userTo);
    const decUserFrom = crypter.decrypt(data.userFrom);

    const followed: unknown[] = await this.followModel.find({
      userTo: decUserTo,
      userFrom: decUserFrom,
    });

    //팔로우 찾은게 없으면 false 있으면 true
    return { followed: followed.length === 0 ? false : true };
  }

  addFollow(data: { userTo: string; userFrom: string }) {
    const newOne = new this.followModel({
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
    return this.followModel
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
        ? await this.followModel.find(
            type === 'follower' ? { userTo: userId } : { userFrom: userId },
          )
        : await this.followModel
            .find(
              type === 'follower' ? { userTo: userId } : { userFrom: userId },
            )
            .skip(page * pageLen)
            .limit(pageLen)
            .exec();

    return userIds.map((item) => {
      return type === 'follower' ? String(item.userFrom) : String(item.userTo);
    });
  }

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
      const tmpAllUserList: userinfo[] = await this.followModel
        .find({ userTo: targetUserId })
        .populate(UserFromPopulate)
        .exec()
        .then((res) => {
          return res.map((item: any) => {
            return {
              ...item.getUserFrom._doc,
            };
          });
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
      const tmpAllUserList: userinfo[] = await this.followModel
        .find({ userFrom: targetUserId })
        .populate(UserToPopulate)
        .exec()
        .then((res) => {
          return res.map((item: any) => {
            return {
              ...item.getUserTo._doc,
            };
          });
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
