import { Injectable } from '@nestjs/common';
import { UserService } from './module/user/user.service';
import { FflService } from './module/ffl/ffl.service';
import { PostService } from './module/post/post.service';
import { PostContent } from 'sns-interfaces';

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
  async postFooter(body: {
    userId: string;
    postId: string;
    targetId: string;
  }): Promise<
    PostContent & {
      liked: boolean;
      username: string;
      img: string;
    }
  > {
    //ffl 가서 postId랑 userId로 liked? 체크

    const [
      { liked },
      { likesCount, commentCount, title, createdAt, id },
      { username, img },
    ] = await Promise.all([
      this.checkLiked({ userId: body.userId, postId: body.postId }),
      this.getPost(body.postId),
      this.getUsernameWithImg(body.targetId),
    ]);
    return {
      liked,
      likesCount,
      commentCount,
      username,
      img,
      title,
      createdAt,
      id,
    };
    //post 가서 postId로 count들 가져오기
  }

  //ffl가서 좋아요 눌렀는지 체크
  async checkLiked(body: {
    userId: string;
    postId: string;
  }): Promise<{ liked: boolean }> {
    return this.fflService.checkLiked(body);
  }
  //post 가서 카운트 가져오기
  async getPost(postId: string): Promise<PostContent> {
    return this.postService.getPost(postId);
  }
  async getUsernameWithImg(
    targetId: string,
  ): Promise<{ username: string; img: string }> {
    return this.userService.getUsernameWithImg(targetId);
  }
}
