import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { DirectService } from './direct.service';
import { ExReq } from '../auth/auth.middleware';

@Controller('dm')
export class DirectController {
  constructor(private directService: DirectService) {}

  @Post('/requestChatRoomId')
  async requestChatRoomId(
    @Req() req: ExReq,
    @Body() body: { chatTargetUserId: string },
  ): Promise<{ chatRoomId: number }> {
    return this.directService.requestChatRoomId({
      userId: req.user.userId,
      chatTargetUserId: body.chatTargetUserId,
    });
  }

  @Get('/checkHasNewMessage')
  async checkHasNewMessage(
    @Req() req: ExReq,
  ): Promise<{ hasNewMessage: boolean }> {
    return this.directService.checkHasNewMessage({
      userId: req.user.userId,
    });
  }
}
