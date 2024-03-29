import { Body, Controller, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { PostFooterContent, UserInfo } from 'sns-interfaces/client.interface';
import { crypter } from './common/crypter';
import { ReqUser } from 'sns-interfaces';

export interface LandingContent {
  userId: string;
  liked: boolean;
  username: string;
  img: string;
  _id: string;
  title: string;
  likesCount: number;
  commentCount: number;
  files: string[];
}

@Controller('')
export class AppController {
  constructor(private appService: AppService) {}
  @Post('/tst')
  tst(@Body() body) {
    console.log(body);
    return;
  }

  //AppService의 메서드 이름은 client의 페이지 이름과 매칭

  /**팔로우목록의 3일간 게시글 가져오기 */
  @Post('/landing')
  async landing(
    @Req() req,
    @Body() body: { page: number },
  ): Promise<{ last3daysPosts: LandingContent[] }> {
    return this.appService.landing(req.user.userId, body.page);
  }

  @Post('/userinfo')
  /**usernums + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async userInfo(
    @Req() req,
    @Body()
    body: {
      targetUsername: string | undefined;
    },
  ): Promise<
    | {
        userinfo: UserInfo;
        type: 'otherInfo' | 'myInfo';
        reqUser: ReqUser;
        success: true;
      }
    | { success: false }
  > {
    return this.appService.userInfo(
      req,
      body.targetUsername === undefined
        ? req.user.username
        : body.targetUsername,
    );
  }

  @Post('/postfooter')
  /**게시글 좋아요 했나?, 게시글에 달린 좋아요수, 댓글수 리턴해야함. */
  async postFooter(
    @Body() body: { postId: string; targetId: string },
    @Req() req,
  ): Promise<PostFooterContent> {
    return this.appService.postFooter({
      ...body,
      userId: req.user.userId,
      targetId: crypter.decrypt(body.targetId),
    });
  }
}
