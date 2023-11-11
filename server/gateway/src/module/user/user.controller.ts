import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { crypter } from 'src/common/crypter';

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

  @Post('/changeintroducename')
  async changeIntroduceName(
    @Body() body: { userId: string; introduceName: string },
  ): Promise<{ success: boolean }> {
    return this.userService.changeIntroduceName(body);
  }

  @Get('/getusernamewithimg')
  async getUsernameWithImg(@Req() req): Promise<{
    username: string;
    img: string;
    userId: number;
  }> {
    return this.userService.getUsernameWithImg(
      crypter.decrypt(req.user.userId),
    );
  }

  @Post('/searchusersbysearchstring')
  searchUsersBySearchString(
    @Body() body: { searchString: string; page: number },
  ) {
    return this.userService.searchUsersBySearchString(body);
  }

  @Post('/getFollowCount')
  getFollowCount(@Body() body: { username: string }) {
    return this.userService.getFollowCount(body);
  }
}
