import { Body, Controller, Post, Req } from '@nestjs/common';
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
  async addLike(@Body() body: { postId: string }, @Req() req) {
    return this.fflService.addLike({
      postId: body.postId,
      userId: req.user.userId,
    });
  }

  @Post('/removelike')
  async removeLike(@Body() body: { postId: string }, @Req() req) {
    return this.fflService.removeLike({
      postId: body.postId,
      userId: req.user.userId,
    });
  }

  @Post('/addcommentlike')
  async addCommentLike(@Body() body: { commentId: number }, @Req() req) {
    return this.fflService.addCommentLike({
      commentId: body.commentId,
      userId: req.user.userId,
    });
  }

  @Post('/removecommentlike')
  async removeCommentLike(
    @Body() body: { commentId: number; userId: string },
    @Req() req,
  ) {
    return this.fflService.removeCommentLike({
      commentId: body.commentId,
      userId: req.user.userId,
    });
  }

  @Post('/addcocommentlike')
  async addCocommentLike(@Body() body: { cocommentId: number }, @Req() req) {
    return this.fflService.addCocommentLike({
      cocommentId: body.cocommentId,
      userId: req.user.userId,
    });
  }

  @Post('/removecocommentlike')
  async removeCocommentLike(@Body() body: { cocommentId: number }, @Req() req) {
    return this.fflService.removeCocommentLike({
      cocommentId: body.cocommentId,
      userId: req.user.userId,
    });
  }

  @Post('/getuserlist')
  async getUserList(
    @Body()
    body: {
      id: string;
      type: 'like' | 'follower' | 'following';
      page: number;
    },
  ): Promise<{
    userList: { userId: string; img: string; username: string }[];
  }> {
    return this.fflService.getUserList(body);
  }

  @Post('/searchUserFfl')
  searchUserFfl(
    @Body()
    body: {
      type: 'like' | 'follower' | 'following';
      searchString: string;
      target: string;
    },
  ) {
    return this.fflService.searchUserFfl(body);
  }
}
