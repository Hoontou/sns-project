import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { DmService } from './dm.service';

@Controller('dm')
export class DmController {
  constructor(private dmService: DmService) {}

  @Post('/requestChatRoomId')
  async requestChatRoomId(
    @Req() req,
    @Body() body: { chatTargetUserId: string },
  ): Promise<{ chatRoomId: number }> {
    return this.dmService.requestChatRoomId({
      userId: req.user.userId,
      chatTargetUserId: body.chatTargetUserId,
    });
  }
}
