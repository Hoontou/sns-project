import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('')
export class AppController {
  constructor(private appService: AppService) {}

  @Post('/userinfo')
  /**usernums + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async getUserInfo(@Body() body: { userId: string; myId?: string }): Promise<
    | {
        success: true;
        following: number;
        follower: number;
        postcount: number;
        username: string;
      }
    | { success: false }
  > {
    return this.appService.getUserInfo({
      userId: body.userId,
      myId: body.myId === undefined ? '' : body.myId,
    });
  }

  @Get('/hi')
  hi() {
    return 'hi';
  }
}
