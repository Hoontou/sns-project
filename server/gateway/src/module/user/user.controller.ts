import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/changeusername')
  async changeUsername(
    @Body() body: { userId: string; username: string },
  ): Promise<{ success: boolean; exist?: boolean }> {
    return this.userService.changeUsername(body);
  }

  @Post('/changeintro')
  async changeIntro(
    @Body() body: { userId: string; intro: string },
  ): Promise<{ success: boolean }> {
    return this.userService.changeIntro(body);
  }

  @Get('/getusernamewithimg')
  async getUsernameWithImg(@Req() req) {
    return this.userService.getUsernameWithImg(req.user.userId);
  }
}
