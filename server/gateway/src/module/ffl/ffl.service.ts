import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { crypter } from 'src/common/crypter';
import { AlertDto } from 'sns-interfaces/alert.interface';
import { UserRepository } from '../user/user.repo';
import { FollowCollection } from './repository/follow.cellection';
import { PostLikeCollection } from './repository/postLike.collection';
import { PostService } from '../post/post.service';
import { FflRepository } from './ffl.repository';
import { CommentLikeCollection } from './repository/commentLike.collection';
import { CocommentLikeCollection } from './repository/cocommentLike.collection';
import { AlertService } from '../alert/alert.service';
import { MetadataDto } from '../metadata/repository/metadata.collection';
@Injectable()
export class FflService {
  private logger = new Logger(FflService.name);

  constructor(
    private userService: UserService,
    private userRepository: UserRepository,
    private fflRepository: FflRepository,
    private followCollection: FollowCollection,
    private postLikeCollection: PostLikeCollection,
    private commentLikeCollection: CommentLikeCollection,
    private cocommentLikeCollection: CocommentLikeCollection,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
    private alertService: AlertService,
  ) {
    this.getMyLikes({ userId: '1', page: 0 });
  }

  async checkFollowed(body: {
    userTo: string;
    userFrom: string;
  }): Promise<{ followed: boolean }> {
    return this.followCollection.checkFollowed(body);
  }

  async addFollow(body: { userTo: string; userFrom: string }) {
    const { followed } = await this.checkFollowed(body);
    //팔로우 안돼있으면 팔로우함
    if (followed === false) {
      const alertForm: AlertDto = {
        userId: Number(crypter.decrypt(body.userTo)),
        content: {
          type: 'follow',
          userId: Number(crypter.decrypt(body.userFrom)),
        },
      };
      this.alertService.saveAlert(alertForm);
      this.followCollection.addFollow(body);
      this.userRepository.addFollow(body);
      return;
    }
    return;
  }
  async removeFollow(body: { userTo: string; userFrom: string }) {
    const { followed } = await this.checkFollowed(body);
    //팔로우 돼 있으면 팔로우 취소
    if (followed === true) {
      this.userRepository.removeFollow(body);
      this.followCollection.removeFollow(body);
      return;
    }
    return;
  }

  async checkLiked(body: {
    userId: string;
    postId: string;
  }): Promise<{ liked: boolean }> {
    //userId, postId
    //userId가 postId에 좋아요 눌렀는지 가져와야함.
    const decUserId = crypter.decrypt(body.userId);
    const liked: unknown[] = await this.postLikeCollection.postLikeModel.find({
      userId: decUserId,
      postId: body.postId,
    });

    return { liked: liked.length === 0 ? false : true };
  }

  async addLike(body: {
    userId: string;
    postId: string;
    postOwnerUserId: string;
  }) {
    const { liked } = await this.checkLiked(body);
    //좋아요 안돼있으면 좋아요 누름

    if (liked === true) {
      return;
    }

    if (body.userId !== body.postOwnerUserId) {
      const alertForm: AlertDto = {
        userId: Number(crypter.decrypt(body.postOwnerUserId)),
        content: {
          type: 'like',
          userId: Number(crypter.decrypt(body.userId)),
          postId: body.postId,
        },
      };

      this.alertService.saveAlert(alertForm);
    }

    //ffl에 Doc추가, post에 likesCount증가
    this.postService.addLike({ type: 'post', postId: body.postId });
    this.postLikeCollection.addLike(body);
    return;
  }

  async removeLike(body: { userId: string; postId: string }) {
    const { liked } = await this.checkLiked(body);
    //좋아요 돼 있으면 좋아요 취소
    if (liked === true) {
      this.postLikeCollection.removeLike(body);
      this.postService.removeLike({ type: 'post', postId: body.postId });
      return;
    }
    return;
  }

  async getUserList(body: {
    id: string;
    type: 'like' | 'follower' | 'following'; //어떤 유저리스트를 요청하는지
    page: number;
  }): Promise<{
    userList: { userId: string; img: string; username: string }[];
  }> {
    //1 먼저 userId들을 가져옴
    const { userIds }: { userIds: string[] } =
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

  async addCommentLike(body: { userId: string; commentId: number }) {
    //ffl msa에서 commentId, userId를 commentLikeSchema에 삽입
    this.commentLikeCollection.addCommentLike(body);
    //post msa에서 comment의 likescount 증가
    this.postService.addLike({ type: 'comment', ...body });

    return;
  }

  async removeCommentLike(body: { userId: string; commentId: number }) {
    //ffl msa에서 commentId, userId를 commentLikeSchema에 삭제
    this.commentLikeCollection.removeCommentLike(body);
    //post msa에서 comment의 likescount 감소
    this.postService.removeLike({ type: 'comment', ...body });

    return;
  }

  async addCocommentLike(body: { userId: string; cocommentId: number }) {
    //ffl msa에서 cocommentId, userId를 cocommentLikeSchema에 삽입
    this.cocommentLikeCollection.addCocommentLike(body);
    //post msa에서 cocomment의 likescount 증가
    this.postService.addLike({ type: 'cocomment', ...body });

    return;
  }

  async removeCocommentLike(body: { userId: string; cocommentId: number }) {
    //ffl msa에서 cocommentId, userId를 cocommentLikeSchema에 삭제
    this.cocommentLikeCollection.removeCocommentLike(body);
    //post msa에서 cocomment의 likescount 감소
    this.postService.removeLike({ type: 'cocomment', ...body });

    return;
  }

  async getCommentLiked(data: {
    commentIdList: number[];
    userId: string;
  }): Promise<{
    commentLikedList: boolean[];
  }> {
    return this.commentLikeCollection.getCommentLiked(data);
  }

  async getCocommentLiked(data: {
    cocommentIdList: number[];
    userId: string;
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

  async getMyLikes(data: { userId: string; page: number }) {
    const len = 12;
    const _ids = await this.postLikeCollection.postLikeModel
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
