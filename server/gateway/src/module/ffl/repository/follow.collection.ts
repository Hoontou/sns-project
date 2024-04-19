import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import {
  FollowDocument,
  FollowSchemaDefinitionExecPop,
  UserFromPop,
  UserToPop,
} from './schema/follow.schema';
import {
  cacheManager,
  defaultUserinfo,
  userinfo,
} from '../common/userlist.cache.manager';

@Injectable()
export class FollowCollection {
  private logger = new Logger(FollowCollection.name);

  constructor(
    @InjectModel('follow')
    private followModel: Model<FollowDocument>,
  ) {}

  async checkFollowed(data: { userTo: number; userFrom: number }): Promise<{
    followed: boolean;
  }> {
    //myId가 userId를 팔로우했는지 가져와야함.
    //userFrom: myId, userTo: userId

    const followed: unknown[] = await this.followModel.find({
      userTo: data.userTo,
      userFrom: data.userFrom,
    });

    //팔로우 찾은게 없으면 false 있으면 true
    return { followed: followed.length === 0 ? false : true };
  }

  addFollow(data: { userTo: number; userFrom: number }) {
    const newOne = new this.followModel({
      userTo: data.userTo,
      userFrom: data.userFrom,
    });
    newOne
      .save()
      .then(() => {
        this.logger.debug('follow stored in mongo successfully');
      })
      .catch((err) => {
        this.logger.error(err);
        this.logger.error('err when storing follow in mongo');
      });

    return;
  }

  removeFollow(data: { userTo: number; userFrom: number }) {
    this.followModel
      .findOneAndDelete({
        userTo: data.userTo,
        userFrom: data.userFrom,
      })
      .then(() => {
        // this.logger.debug('follow canceled');
      })
      .catch(() => {
        this.logger.error('err when canceling follow in mongo');
      });

    return;
  }

  async getUserIds(
    userId: number,
    type: 'follower' | 'following',
    page: number,
  ): Promise<number[]> {
    const pageLen = 15;
    const userIds = await this.followModel
      .find(type === 'follower' ? { userTo: userId } : { userFrom: userId })
      .skip(page * pageLen)
      .limit(pageLen)
      .exec();

    return userIds.map((item) => {
      return type === 'follower' ? item.userFrom : item.userTo;
    });
  }

  async getMyFollowingUserIds(userId: number): Promise<number[]> {
    const userIds = await this.followModel.find({ userFrom: userId });

    return userIds.map((item) => {
      return item.userTo;
    });
  }

  async searchUserFollower(data: {
    targetUser: string;
    searchString: string;
  }): Promise<
    {
      username: string;
      introduceName: string;
      img: string;
    }[]
  > {
    const type = 'follower';
    const targetUserId = crypter.decrypt(data.targetUser);

    //캐시에서 가져온다
    const userList: userinfo[] | undefined = cacheManager.getUserList({
      type,
      target: targetUserId,
      searchString: data.searchString,
    });

    if (userList) {
      // this.logger.debug('list is existed, no db request');
      return findMatchingIndices(userList, data.searchString);
    }

    // this.logger.debug(`missing from ${type} container, loading requested`);
    //캐시에 없다면 디비에서 가져온다
    const tmpAllUserList: userinfo[] = await this.followModel
      .find({ userTo: targetUserId })
      .populate(UserFromPop)
      .lean()
      .then((res) => {
        return res.map((item: FollowSchemaDefinitionExecPop) => {
          const userinfo = item.userFromPop
            ? {
                username: item.userFromPop.username,
                img: item.userFromPop.img,
                introduceName: item.userFromPop.introduceName,
              }
            : defaultUserinfo;
          //하지만, 데이터가 제대로 들어가있으면 default값이 들어가는일은 없을거임.

          return userinfo;
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

  /**팔로잉에서 사람검색 */
  async searchUserFollowing(data: {
    targetUser: string;
    searchString: string;
  }) {
    const type = 'following';
    const targetUserId = crypter.decrypt(data.targetUser);

    //캐시에서 가져온다
    const userList: userinfo[] | undefined = cacheManager.getUserList({
      type,
      target: targetUserId,
      searchString: data.searchString,
    });

    if (userList) {
      // this.logger.debug('list is existed, no db request');
      return findMatchingIndices(userList, data.searchString);
    }
    // this.logger.debug(`missing from ${type} container, loading requested`);

    //캐시에 없다면 디비에서 가져온다
    const tmpAllUserList: userinfo[] = await this.followModel
      .find({ userFrom: targetUserId })
      .populate(UserToPop)
      .lean()
      .then((res) => {
        return res.map((item: FollowSchemaDefinitionExecPop) => {
          const userinfo = item.userToPop
            ? {
                username: item.userToPop.username,
                img: item.userToPop.img,
                introduceName: item.userToPop.introduceName,
              }
            : defaultUserinfo;
          //하지만, 데이터가 제대로 들어가있으면 default값이 들어가는일은 없을거임.

          return userinfo;
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
}

/**인풋으로 온 리스트 돌면서 prefix로 매칭되는것만 리턴 */
export const findMatchingIndices = (userList: userinfo[], prefix: string) => {
  return userList.filter((user) => user.username.startsWith(prefix));
};
