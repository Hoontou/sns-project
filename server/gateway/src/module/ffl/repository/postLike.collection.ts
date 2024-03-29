import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { crypter } from '../../../common/crypter';
import { PostLikeSchemaDefinition } from './schema/postLike.schema';
import { cacheManager, userinfo } from '../common/userlist.cache.manager';
import { findMatchingIndices } from './follow.cellection';
import { MetadataDto } from '../../../module/metadata/repository/metadata.collection';
@Injectable()
export class PostLikeCollection {
  constructor(
    @InjectModel('like')
    public readonly postLikeModel: Model<PostLikeSchemaDefinition>,
  ) {}

  addLike(data: { userId: string; postId: string }) {
    const newOne = new this.postLikeModel({
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
    return this.postLikeModel
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
        ? await this.postLikeModel.find({ postId })
        : await this.postLikeModel
            .find({ postId })
            .skip(page * pageLen)
            .limit(pageLen)
            .exec();

    return userIds.map((item) => {
      return String(item.userId);
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

    if (userList === undefined) {
      console.log(`missing from ${type} container, loading requested`);

      //캐시에 없다면 디비에서 가져온다
      const tmpAllUserList: userinfo[] = await this.postLikeModel
        .find({ postId: data.targetPostId })
        .populate('getUserId')
        .exec()
        .then((res) => {
          return res.map((item: any) => {
            return {
              ...item.getUserId._doc,
            };
          });
        });

      //가져온거 캐시에 등록
      cacheManager.loadUserList({
        type,
        userList: tmpAllUserList,
        target: data.targetPostId,
      });
      //prefix find 해서 리턴
      return findMatchingIndices(tmpAllUserList, data.searchString);
    }
    console.log('list is existed, no db request');

    return findMatchingIndices(userList, data.searchString);
  }

  async getMyLikes(data: { userId: string; page: number }) {
    const len = 12;
    const _ids = await this.postLikeModel
      .find({
        userId: crypter.decrypt(data.userId),
      })
      .populate('getMetadata')
      .sort({ _id: -1 })
      .limit(len)
      .skip(len * data.page)
      .exec();

    const tmp = _ids.map((i) => {
      return i.$getPopulatedDocs()[0] as unknown;
    }) as MetadataDto[];

    return tmp;
  }
}
