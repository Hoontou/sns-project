import { Body, Controller, Post, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CommentItemContent, MetadataDto } from 'sns-interfaces';
import { CocommentContent } from 'sns-interfaces/client.interface';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('/addcomment')
  addComment(@Body() body: { postId: string; comment: string }, @Req() req) {
    return this.postService.addComment({ ...body, userId: req.user.userId });
  }

  @Post('/addcocomment')
  addCocomment(
    @Body() body: { commentId: number; cocomment: string },
    @Req() req,
  ) {
    return this.postService.addCocomment({ ...body, userId: req.user.userId });
  }

  @Post('/getcommentlist')
  getCommentList(
    @Body() body: { postId: string; page: number },
    @Req() req,
  ): Promise<{ commentItem: CommentItemContent[] }> {
    return this.postService.getCommentList(body, req.user.userId);
  }

  @Post('/getcocommentlist')
  getCocommentList(
    @Body() body: { commentId: number; page: number },
    @Req() req,
  ): Promise<{ cocommentItem: CocommentContent[] }> {
    return this.postService.getCocommentList(body, req.user.userId);
  }

  @Post('/searchhashtag')
  searchHashtag(@Body() body: { hashtag: string }) {
    return;
  }

  @Post('/getpostsbyhashtag')
  getPostsByHashtag(
    @Body() body: { hashtag: string; page: number },
    @Req() req,
  ): Promise<
    | {
        metadatas: MetadataDto[];
        searchSuccess: true;
        totalPostCount: number;
        userId: string;
      }
    | { searchSuccess: false }
  > {
    return this.postService.getPostsByHashtag(body, req.user.userId);
  }
}
