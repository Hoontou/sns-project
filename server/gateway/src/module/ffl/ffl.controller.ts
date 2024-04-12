import { Body, Controller, Post, Req } from '@nestjs/common';
import { FflService } from './ffl.service';
import { ExReq } from '../auth/auth.middleware';

@Controller('ffl')
export class FflController {
  constructor(private fflService: FflService) {}

  @Post('/addfollow')
  async addFollow(@Body() body: { userTo: string }, @Req() req: ExReq) {
    return this.fflService.addFollow({ ...body, userFrom: req.user.userId });
  }

  @Post('/removefollow')
  async removeFollow(@Body() body: { userTo: string }, @Req() req: ExReq) {
    return this.fflService.removeFollow({ ...body, userFrom: req.user.userId });
  }

  @Post('/addlike')
  async addLike(
    @Body() body: { postId: string; postOwnerUserId: string },
    @Req() req: ExReq,
  ) {
    return this.fflService.addLike({
      postId: body.postId,
      userId: req.user.userId,
      postOwnerUserId: body.postOwnerUserId,
    });
  }

  @Post('/removelike')
  async removeLike(@Body() body: { postId: string }, @Req() req: ExReq) {
    return this.fflService.removeLike({
      postId: body.postId,
      userId: req.user.userId,
    });
  }

  @Post('/addcommentlike')
  async addCommentLike(@Body() body: { commentId: number }, @Req() req: ExReq) {
    return this.fflService.addCommentLike({
      commentId: body.commentId,
      userId: req.user.userId,
    });
  }

  @Post('/removecommentlike')
  async removeCommentLike(
    @Body() body: { commentId: number; userId: string },
    @Req() req: ExReq,
  ) {
    return this.fflService.removeCommentLike({
      commentId: body.commentId,
      userId: req.user.userId,
    });
  }

  @Post('/addcocommentlike')
  async addCocommentLike(
    @Body() body: { cocommentId: number },
    @Req() req: ExReq,
  ) {
    return this.fflService.addCocommentLike({
      cocommentId: body.cocommentId,
      userId: req.user.userId,
    });
  }

  @Post('/removecocommentlike')
  async removeCocommentLike(
    @Body() body: { cocommentId: number },
    @Req() req: ExReq,
  ) {
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
