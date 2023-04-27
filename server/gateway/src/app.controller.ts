import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './module/user/user.service';

@Controller('')
export class AppController {
  constructor(private userService: UserService) {}

  @Post('/userinfo')
  async getUsernums(@Body() body: { userId: string }): Promise<{
    following: number;
    follower: number;
    postcount: number;
  }> {
    return this.userService.getUsernums(body.userId);
  }

  @Get('/hi')
  hi() {
    return 'hi';
  }
}
