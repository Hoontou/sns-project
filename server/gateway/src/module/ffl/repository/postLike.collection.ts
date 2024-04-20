import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import {
  MetadataPop,
  PostLikeDocument,
  PostLikeSchemaDefinitionExecPop,
  UserPop,
} from './schema/postLike.schema';
import {
  cacheManager,
  defaultUserinfo,
  userinfo,
} from '../common/userlist.cache.manager';
import { findMatchingIndices } from './follow.collection';
@Injectable()
export class PostLikeCollection {
  private logger = new Logger(PostLikeCollection.name);
  constructor(
    @InjectModel('like')
    public readonly postLikeModel: Model<PostLikeDocument>,
  ) {}

  addLike(data: { userId: number; postId: string }) {
    const newOne = new this.postLikeModel({
      userId: crypter.decrypt(data.userId),
      postId: data.postId,
    });
    newOne
      .save()
      .then(() => {
        // this.logger.debug('like stored in mongo successfully');
      })
      .catch(() => {
        this.logger.error('err when storing like in mongo');
      });
    return;
  }

  removeLike(data: { userId: number; postId: string }) {
    this.postLikeModel
      .findOneAndDelete({
        userId: crypter.decrypt(data.userId),
        postId: data.postId,
      })
      .then(() => {
        // this.logger.debug('like removed');
      })
      .catch(() => {
        this.logger.error('err when canceling like in mongo');
      });
    return;
  }

  async getUserIds(postId: string, page: number): Promise<number[]> {
    const pageLen = 5;
    const userIds =
      page === -1
        ? await this.postLikeModel.find({ postId })
        : await this.postLikeModel
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
    const type = 'like';

    //캐시에서 가져온다
    const userList = cacheManager.getUserList({
      type,
      target: data.targetPostId,
      searchString: data.searchString,
    });

    if (userList) {
      // this.logger.debug('list is existed, no db request');
      return findMatchingIndices(userList, data.searchString);
    }

    // this.logger.debug(`missing from ${type} container, loading requested`);
    //캐시에 없다면 디비에서 가져온다
    //가져온거 캐시에 등록
    cacheManager.loadUserList({
      type,
      userList: await this.getAllLikeUserList(data.targetPostId),
      target: data.targetPostId,
    });

    return this.searchUserLike(data);
  }

  async getMyLikes(data: {
    userId: number;
    page: number;
  }): Promise<PostLikeSchemaDefinitionExecPop[]> {
    const len = 12;
    return this.postLikeModel
      .find({
        userId: data.userId,
      })
      .populate(MetadataPop)
      .sort({ _id: -1 })
      .limit(len)
      .skip(len * data.page)
      .lean();
  }

  private getAllLikeUserList(targetPostId: string): Promise<userinfo[]> {
    return this.postLikeModel
      .find({ postId: targetPostId })
      .populate(UserPop)
      .lean()
      .then((res) => {
        return res.map((item: PostLikeSchemaDefinitionExecPop) => {
          const userinfo = item.userPop
            ? {
                username: item.userPop.username,
                img: item.userPop.img,
                introduceName: item.userPop.introduceName,
              }
            : defaultUserinfo;
          //하지만, 데이터가 제대로 들어가있으면 default값이 들어가는일은 없을거임.

          return userinfo;
        });
      });
  }
}
