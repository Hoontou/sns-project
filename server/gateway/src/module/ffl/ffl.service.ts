import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { crypter } from 'src/common/crypter';
import { AlertDto } from 'sns-interfaces/alert.interface';
import { PostLikeCollection } from './repository/postLike.collection';
import { PostService } from '../post/post.service';
import { CommentLikeCollection } from './repository/commentLike.collection';
import { CocommentLikeCollection } from './repository/cocommentLike.collection';
import { AlertService } from '../alert/alert.service';
import { FollowCollection } from './repository/follow.collection';
import { PostLikeSchemaDefinition } from './repository/schema/postLike.schema';
import { CocommentLikeSchemaDefinition } from './repository/schema/cocommentLike.schema';

@Injectable()
export class FflService {
  private logger = new Logger(FflService.name);

  constructor(
    private userService: UserService,
    private followCollection: FollowCollection,
    private postLikeCollection: PostLikeCollection,
    private commentLikeCollection: CommentLikeCollection,
    private cocommentLikeCollection: CocommentLikeCollection,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
    private alertService: AlertService,
  ) {}

  async checkFollowed(body: {
    userTo: number;
    userFrom: number;
  }): Promise<{ followed: boolean }> {
    return this.followCollection.checkFollowed(body);
  }

  async addFollow(body: { userTo: string; userFrom: number }) {
    const userTo = crypter.decrypt(body.userTo);
    const form = { userTo, userFrom: body.userFrom };

    const { followed } = await this.checkFollowed(form);
    if (followed) {
      return;
    }
    //팔로우 안돼있으면 팔로우함
    const alertForm: AlertDto = {
      userId: userTo,
      content: {
        type: 'follow',
        userId: body.userFrom,
      },
    };
    this.alertService.saveAlert(alertForm);
    this.followCollection.addFollow(form);
    this.userService.increaseFollowCount(form);
    return;
  }

  async removeFollow(body: { userTo: string; userFrom: number }) {
    const userTo = crypter.decrypt(body.userTo);
    const form = { userTo, userFrom: body.userFrom };

    const { followed } = await this.checkFollowed(form);
    if (!followed) {
      return;
    }
    //팔로우 돼 있으면 팔로우 취소
    this.userService.decreaseFollowCount(form);
    this.followCollection.removeFollow(form);
    return;
  }

  async checkLiked(body: {
    userId: number;
    postId: string;
  }): Promise<{ liked: boolean }> {
    //userId, postId
    //userId가 postId에 좋아요 눌렀는지 가져와야함.
    const liked: PostLikeSchemaDefinition[] =
      await this.postLikeCollection.postLikeModel.find({
        ...body,
      });

    return { liked: liked.length === 0 ? false : true };
  }

  async addLike(body: {
    userId: number;
    postId: string;
    postOwnerUserId: string;
  }) {
    const { liked } = await this.checkLiked(body);
    //좋아요 안돼있으면 좋아요 누름

    if (liked === true) {
      return;
    }

    const decPostOwnerUserId = crypter.decrypt(body.postOwnerUserId);

    //타인의 게시물에 좋아요 했으면 알림전송
    if (body.userId !== decPostOwnerUserId) {
      const alertForm: AlertDto = {
        userId: decPostOwnerUserId,
        content: {
          type: 'like',
          userId: Number(body.userId),
          postId: body.postId,
        },
      };

      this.alertService.saveAlert(alertForm);
    }

    //ffl에 Doc추가, post에 likesCount증가
    this.postService.increaseLikeCount({ type: 'post', postId: body.postId });
    this.postLikeCollection.addLike(body);
    return;
  }

  async removeLike(body: { userId: number; postId: string }) {
    const { liked } = await this.checkLiked(body);
    //좋아요 돼 있으면 좋아요 취소
    if (liked === true) {
      this.postLikeCollection.removeLike(body);
      this.postService.decreaseLikeCount({ type: 'post', postId: body.postId });
      return;
    }
    return;
  }

  async getUserList(body: {
    id: string | number;
    type: 'like' | 'follower' | 'following'; //어떤 유저리스트를 요청하는지
    page: number;
  }): Promise<{
    userList: { userId: string; img: string; username: string }[];
  }> {
    //1 먼저 userId들을 가져옴
    const { userIds }: { userIds: number[] } = await this.getUserIdsByFfl(body);

    if (userIds.length === 0) {
      //1.1 없으면 빈리스트 리턴
      return { userList: [] };
    }

    //2 id들로 userInfo 가져옴
    const {
      userList,
    }: {
      userList: {
        username: string;
        img: string;
        userId: number;
      }[];
    } = await this.userService.getUsernameWithImgList(userIds);

    return {
      userList: userList.map((item) => {
        return { ...item, userId: crypter.encrypt(item.userId) }; //3 클라이언트에 보낼때 암호화
      }),
    };
  }

  async getMyFollowingUserInfos(userId: number) {
    //1 먼저 userId들을 가져옴
    const userIds: number[] =
      await this.followCollection.getMyFollowingUserIds(userId);

    if (userIds.length === 0) {
      //1.1 없으면 빈리스트 리턴
      return { userList: [] };
    }

    //2 id들로 userInfo 가져옴
    const {
      userList,
    }: {
      userList: {
        username: string;
        img: string;
        userId: number;
      }[];
    } = await this.userService.getUsernameWithImgList(userIds);

    return { userList };
  }

  async addCommentLike(body: { userId: number; commentId: number }) {
    //ffl msa에서 commentId, userId를 commentLikeSchema에 삽입
    this.commentLikeCollection.addCommentLike(body);
    //post msa에서 comment의 likescount 증가
    this.postService.increaseLikeCount({ type: 'comment', ...body });

    return;
  }

  async removeCommentLike(body: { userId: number; commentId: number }) {
    //ffl msa에서 commentId, userId를 commentLikeSchema에 삭제
    this.commentLikeCollection.removeCommentLike(body);
    //post msa에서 comment의 likescount 감소
    this.postService.decreaseLikeCount({ type: 'comment', ...body });

    return;
  }

  async addCocommentLike(body: { userId: number; cocommentId: number }) {
    //ffl msa에서 cocommentId, userId를 cocommentLikeSchema에 삽입
    this.cocommentLikeCollection.addCocommentLike(body);
    //post msa에서 cocomment의 likescount 증가
    this.postService.increaseLikeCount({ type: 'cocomment', ...body });

    return;
  }

  async removeCocommentLike(body: { userId: number; cocommentId: number }) {
    //ffl msa에서 cocommentId, userId를 cocommentLikeSchema에 삭제
    this.cocommentLikeCollection.removeCocommentLike(body);
    //post msa에서 cocomment의 likescount 감소
    this.postService.decreaseLikeCount({ type: 'cocomment', ...body });

    return;
  }

  async getCommentLiked(data: {
    commentIdList: number[];
    userId: number;
  }): Promise<{
    commentLikedList: boolean[];
  }> {
    //각각의 댓글에 좋아요 저장된거 가져옴
    const likesList = await this.commentLikeCollection.getCommentLiked(data);

    if (likesList.length === 0) {
      return {
        commentLikedList: Array(data.commentIdList.length).fill(false),
      };
    }

    //투포인터로 밀고가면서 좋아요 체크결과 맞으면 true
    let tmpIndex: number = 0;
    const tmp = [...data.commentIdList].map((i) => {
      if (i === likesList[tmpIndex].commentId) {
        tmpIndex += 1;
        return true;
      }
      return false;
    });
    return { commentLikedList: tmp };
  }

  async getCocommentLiked(data: {
    cocommentIdList: number[];
    userId: number;
  }): Promise<{
    cocommentLikedList: boolean[];
  }> {
    //각각의 대댓글에 좋아요 저장된거 가져옴
    const likesList: CocommentLikeSchemaDefinition[] =
      await this.cocommentLikeCollection.getCocommentLikes(data);

    if (likesList.length === 0) {
      return {
        cocommentLikedList: Array(data.cocommentIdList.length).fill(false),
      };
    }

    //투포인터로 밀고가면서 좋아요 체크결과 맞으면 true
    let tmpIndex: number = 0;
    const tmp = [...data.cocommentIdList].map((i) => {
      if (i === likesList[tmpIndex].cocommentId) {
        tmpIndex += 1;
        return true;
      }
      return false;
    });
    return { cocommentLikedList: tmp };
  }

  async searchUserFfl(data: {
    type: 'like' | 'follower' | 'following';
    searchString: string;
    target: string;
  }) {
    const userList = await this.requestSearchingUsersByType(data);
    if (userList.length === 0) {
      return { userList: [] };
    }
    return { userList };
  }

  getMyLikes(data: { userId: number; page: number }) {
    return this.postLikeCollection.getMyLikes(data);
  }

  /**target에 팔로우 | 팔로잉 | 좋아요 한 사람들 id 가져오는 */
  private async getUserIdsByFfl(data: {
    id: string | number;
    type: 'like' | 'follower' | 'following'; //어떤 유저리스트를 요청하는지
    page: number;
  }): Promise<{
    userIds: number[];
  }> {
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

  private requestSearchingUsersByType(data: {
    type: 'like' | 'follower' | 'following';
    searchString: string;
    target: string;
  }): Promise<
    {
      username: string;
      introduceName: string;
      img: string;
    }[]
  > {
    if (data.type === 'follower') {
      return this.followCollection.searchUserFollower({
        targetUser: data.target,
        searchString: data.searchString,
      });
    }
    if (data.type === 'following') {
      return this.followCollection.searchUserFollowing({
        targetUser: data.target,
        searchString: data.searchString,
      });
    }
    return this.postLikeCollection.searchUserLike({
      targetPostId: data.target,
      searchString: data.searchString,
    });
  }
}
