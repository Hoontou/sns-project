import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CocommentLikeSchemaDefinition } from './repository/schema/cocommentLike.schema';
import { CommentLikeSchemaDefinition } from './repository/schema/commentLike.schema';
import { FollowSchemaDefinition } from './repository/schema/follow.schema';
import { PostLikeSchemaDefinition } from './repository/schema/postLike.schema';
import { crypter } from '../../common/crypter';
import { FollowCollection } from './repository/follow.cellection';
import { PostLikeCollection } from './repository/postLike.collection';

@Injectable()
export class FflRepository {
  constructor(
    private postLikeCollection: PostLikeCollection,
    private followCollection: FollowCollection,
    @InjectModel('commentlike')
    private commentLikeModel: Model<CommentLikeSchemaDefinition>,
    @InjectModel('cocommentlike')
    private cocommentLikeModel: Model<CocommentLikeSchemaDefinition>,
  ) {}

  async getUserIds(data: {
    id: string;
    type: 'like' | 'follower' | 'following'; //어떤 유저리스트를 요청하는지
    page: number;
  }) {
    //좋아요 누른 사람들 or 팔로우 한 사람들 or 팔로잉 하는 사람들
    if (data.type === 'like') {
      return {
        userIds: await this.postLikeCollection.getUserIds(data.id, data.page),
      };
    }

    return {
      userIds: await this.followCollection.getUserIds(
        crypter.decrypt(data.id),
        data.type as 'follower' | 'following',
        data.page,
      ),
    };
  }

  async serchUserFfl(data: {
    type: 'like' | 'follower' | 'following';
    searchString: string;
    target: string;
  }) {
    const selectAndRequestSearching = (type) => {
      if (type === 'follower') {
        return this.followCollection.searchUserFollower({
          targetUser: data.target,
          searchString: data.searchString,
        });
      }
      if (type === 'following') {
        return this.followCollection.searchUserFollowing({
          targetUser: data.target,
          searchString: data.searchString,
        });
      }
      return this.postLikeCollection.searchUserLike({
        targetPostId: data.target,
        searchString: data.searchString,
      });
    };

    const searchedUserList: {
      username: string;
      introduceName: string;
      img: string;
    }[] = await selectAndRequestSearching(data.type);

    return { userList: searchedUserList };
  }
}
