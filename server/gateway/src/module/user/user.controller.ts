import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IntroduceUsernameDto, UsernameDto } from './dto/changeInfo.dto';
import { ExReq } from '../auth/auth.middleware';
import { crypter } from 'src/common/crypter';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/changeusername')
  async changeUsername(
    @Body(ValidationPipe) body: UsernameDto,
    @Req() req: ExReq,
  ): Promise<{ success: boolean; exist?: boolean }> {
    return this.userService.changeUsername({
      ...body,
      userId: req.user.userId,
    });
  }

  @Post('/changeintro')
  async changeIntro(
    @Body() body: { intro: string },
    @Req() req: ExReq,
  ): Promise<{ success: boolean }> {
    return this.userService.changeIntro({ ...body, userId: req.user.userId });
  }

  @Post('/changeintroducename')
  async changeIntroduceName(
    @Body(ValidationPipe) body: IntroduceUsernameDto,
    @Req() req: ExReq,
  ): Promise<{ success: boolean }> {
    return this.userService.changeIntroduceName({
      ...body,
      userId: req.user.userId,
    });
  }

  @Get('/getusernamewithimg')
  async getUsernameWithImg(@Req() req: ExReq): Promise<{
    username: string;
    img: string;
    userId: string;
    introduceName: string;
  }> {
    const tmp = await this.userService.getUsernameWithImg(req.user.userId);

    return { ...tmp, userId: crypter.encrypt(tmp.userId) };
  }

  @Post('/getFollowCount')
  getFollowCount(@Body() body: { username: string }) {
    return this.userService.getFollowCount(body);
  }
}
