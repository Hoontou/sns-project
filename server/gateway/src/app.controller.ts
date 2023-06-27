import { Body, Controller, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { PostFooterContent, UserInfo } from 'sns-interfaces/client.interface';

export interface LandingContent {
  userId: string;
  liked: boolean;
  username: string;
  img: string;
  id: string;
  title: string;
  likesCount: number;
  commentCount: number;
  files: string[];
}

@Controller('')
export class AppController {
  constructor(private appService: AppService) {}

  @Post('/landing')
  async landing(
    @Req() req,
    @Body() body: { page: number },
  ): Promise<{ last3daysPosts: LandingContent[]; userId: string }> {
    return this.appService.landing(req.user.userId, body.page);
  }

  @Post('/userinfo')
  /**usernums + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async userInfo(
    @Body() body: { userId: string; myId: '' | string },
  ): Promise<UserInfo | { success: false }> {
    return this.appService.userInfo(body);
  }

  @Post('/postfooter')
  /**게시글 좋아요 했나?, 게시글에 달린 좋아요수, 댓글수 리턴해야함. */
  async postFooter(
    @Body() body: { userId: string; postId: string; targetId: string },
  ): Promise<PostFooterContent> {
    return this.appService.postFooter({ ...body, type: 'postFooter' });
  }
}
