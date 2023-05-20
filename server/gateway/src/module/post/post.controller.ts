import { Body, Controller, Post, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CommentItemContent } from 'sns-interfaces';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('/getcommentitem')
  getCommentItem(
    @Body() body: { postId: string; page: number },
    @Req() req,
  ): Promise<{ commentItem: CommentItemContent[] }> {
    return this.postService.getCommentItem(body, req.user.userId);
  }
}
