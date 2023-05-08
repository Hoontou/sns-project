import { Body, Controller, Post } from '@nestjs/common';
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

  @Post('changeintro')
  async changeIntro(
    @Body() body: { userId: string; intro: string },
  ): Promise<{ success: boolean }> {
    return this.userService.changeIntro(body);
  }
}
