import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { DirectService } from './direct.service';

@Controller('dm')
export class DirectController {
  constructor(private directService: DirectService) {}

  @Post('/requestChatRoomId')
  async requestChatRoomId(
    @Req() req,
    @Body() body: { chatTargetUserId: string },
  ): Promise<{ chatRoomId: number }> {
    return this.directService.requestChatRoomId({
      userId: req.user.userId,
      chatTargetUserId: body.chatTargetUserId,
    });
  }

  @Get('/checkHasNewMessage')
  async checkHasNewMessage(@Req() req): Promise<{ hasNewMessage: boolean }> {
    return this.directService.checkHasNewMessage({
      userId: req.user.userId,
    });
  }
}
