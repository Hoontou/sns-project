import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { PostContent } from 'sns-interfaces';

@Controller('')
export class AppController {
  constructor(private appService: AppService) {}

  @Post('/landing')
  async landing(@Req() req, @Body() body: { page: number }) {
    return this.appService.landing(req.user.userId, body.page);
  }

  @Post('/userinfo')
  /**usernums + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async userInfo(@Body() body: { userId: string; myId: '' | string }): Promise<
    | {
        success: true;
        following: number;
        follower: number;
        postcount: number;
        img: string;
        introduce: string;
        username: string;
      }
    | { success: false }
  > {
    return this.appService.userInfo(body);
  }

  @Post('/postfooter')
  /**게시글 좋아요 했나?, 게시글에 달린 좋아요수, 댓글수 리턴해야함. */
  async postFooter(
    @Body() body: { userId: string; postId: string; targetId: string },
  ): Promise<
    PostContent & {
      liked: boolean;
      username: string;
      img: string;
    }
  > {
    return this.appService.postFooter({ ...body, type: 'postFooter' });
  }
}
