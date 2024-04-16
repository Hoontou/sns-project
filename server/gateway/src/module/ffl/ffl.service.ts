import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { crypter } from 'src/common/crypter';
import { AlertDto } from 'sns-interfaces/alert.interface';
import { PostLikeCollection } from './repository/postLike.collection';
import { PostService } from '../post/post.service';
import { FflRepository } from './ffl.repository';
import { CommentLikeCollection } from './repository/commentLike.collection';
import { CocommentLikeCollection } from './repository/cocommentLike.collection';
import { AlertService } from '../alert/alert.service';
import { FollowCollection } from './repository/follow.collection';
import { PostLikeSchemaDefinition } from './repository/schema/postLike.schema';

@Injectable()
export class FflService {
  private logger = new Logger(FflService.name);

  constructor(
    private userService: UserService,
    private fflRepository: FflRepository,
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

    if (body.userId !== crypter.decrypt(body.postOwnerUserId)) {
      const alertForm: AlertDto = {
        userId: Number(crypter.decrypt(body.postOwnerUserId)),
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
    const { userIds }: { userIds: number[] } =
      await this.fflRepository.getUserIds(body);

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

  async getAllFollowingUserlistByUserId(userId: number) {
    //1 먼저 userId들을 가져옴
    const userIds: number[] =
      await this.fflRepository.getAllFollowingUserIdListByUserId(userId);

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
    return this.commentLikeCollection.getCommentLiked(data);
  }

  async getCocommentLiked(data: {
    cocommentIdList: number[];
    userId: number;
  }): Promise<{
    cocommentLikedList: boolean[];
  }> {
    return this.cocommentLikeCollection.getCocommentLiked(data);
  }

  async searchUserFfl(data: {
    type: 'like' | 'follower' | 'following';
    searchString: string;
    target: string;
  }) {
    const { userList } = await this.fflRepository.serchUserFfl(data);
    if (userList.length === 0) {
      return { userList: [] };
    }
    return { userList };
  }

  getMyLikes(data: { userId: number; page: number }) {
    return this.postLikeCollection.getMyLikes(data);
  }
}
