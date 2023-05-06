import { Injectable } from '@nestjs/common';
import { UserService } from './module/user/user.service';
import { FflService } from './module/ffl/ffl.service';
import { PostService } from './module/post/post.service';

@Injectable()
export class AppService {
  constructor(
    private userService: UserService,
    private fflService: FflService,
    private postService: PostService,
  ) {}

  /**userinfo + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async userInfo(body: { userId: string; myId: '' | string }): Promise<
    | {
        success: true;
        following: number;
        follower: number;
        postcount: number;
        username: string;
        followed: boolean;
        img: string;
        introduce: string;
      }
    | { success: false }
  > {
    //일단 숫자를 찾는다.
    const userinfo = await this.userService.getUserinfo(body.userId);

    if (userinfo.success === false) {
      //실패했으면 바로 리턴.
      return userinfo;
    }
    //성공했으면 계속진행
    // 팔로우 체크할 필요없으면 그냥 펄스넣어서 리턴.
    if (body.myId === '') {
      return { ...userinfo, followed: false };
    }
    //팔로우체크후 리턴, 여기까지왔으면 아래는 진짜 아이디만 들어감.
    //타입추론이 잘 안돼서 가독성좋게 ''로 했음.
    const { followed } = await this.fflService.checkFollowed(body);
    return { ...userinfo, followed };
  }

  /**게시글 좋아요 했나?, 게시글에 달린 좋아요수, 댓글수 리턴해야함. */
  async postHeader(body: { userId: string; postId: string }): Promise<{
    liked: boolean;
    likesCount: number;
    commentCount: number;
    username: string;
  }> {
    //ffl 가서 postId랑 userId로 liked? 체크

    const [{ liked }, { likesCount, commentCount }, { username }] =
      await Promise.all([
        this.checkLiked(body),
        this.getPostinfo(body),
        this.getUsername(body),
      ]);
    return { liked, likesCount, commentCount, username };
    //post 가서 postId로 count들 가져오기
  }

  async checkLiked(body: {
    userId: string;
    postId: string;
  }): Promise<{ liked: boolean }> {
    return this.fflService.checkLiked(body);
  }
  //post 가서 카운트 가져오기
  async getPostinfo(body: {
    userId: string;
    postId: string;
  }): Promise<{ likesCount: number; commentCount: number }> {
    return this.postService.getPostnums(body.postId);
  }
  async getUsername(body: {
    userId: string;
    postId: string;
  }): Promise<{ username: string }> {
    return this.userService.getUsername(body.userId);
  }
}
