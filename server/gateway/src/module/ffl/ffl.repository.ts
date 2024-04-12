import { Injectable } from '@nestjs/common';
import { FollowCollection } from './repository/follow.collection';
import { PostLikeCollection } from './repository/postLike.collection';
import { crypter } from 'src/common/crypter';

@Injectable()
export class FflRepository {
  constructor(
    private postLikeCollection: PostLikeCollection,
    private followCollection: FollowCollection,
  ) {}

  async getUserIds(data: {
    id: string | number;
    type: 'like' | 'follower' | 'following'; //어떤 유저리스트를 요청하는지
    page: number;
  }) {
    //좋아요 누른 사람들 or 팔로우 한 사람들 or 팔로잉 하는 사람들
    if (data.type === 'like') {
      return {
        userIds: await this.postLikeCollection.getUserIds(
          String(data.id), //_id
          data.page,
        ),
      };
    }

    return {
      userIds: await this.followCollection.getUserIds(
        crypter.decrypt(data.id), //encrypted userId
        data.type as 'follower' | 'following',
        data.page,
      ),
    };
  }

  getAllFollowingUserIdListByUserId(userId: number) {
    return this.followCollection.getAllFollowingUserIdListByUserId(userId);
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
