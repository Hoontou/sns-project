import { Body, Controller, Post } from '@nestjs/common';
import { FflService } from './ffl.service';

@Controller('ffl')
export class FflController {
  constructor(private fflService: FflService) {}

  @Post('/addfollow')
  async addFollow(@Body() body: { userTo: string; userFrom: string }) {
    return this.fflService.addFollow(body);
  }

  @Post('/removefollow')
  async removeFollow(@Body() body: { userTo: string; userFrom: string }) {
    return this.fflService.removeFollow(body);
  }

  @Post('/addlike')
  async addLike(@Body() body: { userId: string; postId: string }) {
    return this.fflService.addLike(body);
  }

  @Post('/removelike')
  async removeLike(@Body() body: { userId: string; postId: string }) {
    return this.fflService.removeLike(body);
  }

  @Post('/addcommentlike')
  async addCommentLike(@Body() body: { commentId: number; userId: string }) {
    return this.fflService.addCommentLike(body);
  }

  @Post('/removecommentlike')
  async removeCommentLike(@Body() body: { commentId: number; userId: string }) {
    return this.fflService.removeCommentLike(body);
  }

  @Post('/addcocommentlike')
  async addCocommentLike(
    @Body() body: { cocommentId: number; userId: string },
  ) {
    return this.fflService.addCocommentLike(body);
  }

  @Post('/removecocommentlike')
  async removeCocommentLike(
    @Body() body: { cocommentId: number; userId: string },
  ) {
    return this.fflService.removeCocommentLike(body);
  }

  @Post('/getuserlist')
  async getUserList(
    @Body() body: { id: string; type: 'like' | 'follower' | 'following' },
  ): Promise<{
    userList: { userId: string; img: string; username: string }[];
  }> {
    return this.fflService.getUserList(body);
  }
}
