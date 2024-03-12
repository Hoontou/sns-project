import { Body, Controller, Delete, Post, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CommentItemContent, MetadataDto } from 'sns-interfaces';
import {
  CocommentContent,
  PostFooterContent,
} from 'sns-interfaces/client.interface';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('/addcomment')
  addComment(
    @Body() body: { postId: string; comment: string; postOwnerUserId: string },
    @Req() req,
  ) {
    return this.postService.addComment({ ...body, userId: req.user.userId });
  }

  @Post('/addcocomment')
  addCocomment(
    @Body()
    body: { commentId: number; cocomment: string; commentOwnerUserId: string },
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
  @Post('/getcomment')
  getComment(
    @Body() body: { commentId: number },
    @Req() req,
  ): Promise<{
    commentItem: CommentItemContent[] | undefined;
    userId: string;
    // postFooterContent: PostFooterContent;
  }> {
    return this.postService.getComment({
      commentId: body.commentId,
      userId: req.user.userId,
    });
  }

  @Post('/getcocommentlist')
  getCocommentList(
    @Body() body: { commentId: number; page: number },
    @Req() req,
  ): Promise<{ cocommentItem: CocommentContent[] }> {
    return this.postService.getCocommentList(body, req.user.userId);
  }

  @Post('/getHighlightCocomment')
  getHighlightCocomment(
    @Body() body: { cocommentId: number },
    @Req() req,
  ): Promise<{
    cocommentItem: CocommentContent[];
    commentItem: CommentItemContent[];
  }> {
    return this.postService.getHighlightCocomment({
      ...body,
      userId: req.user.userId,
    });
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

  @Post('/searchpostsbysearchstring')
  searchPostsByString(@Body() body: { searchString: string; page: number }) {
    return this.postService.searchPostsBySearchString(body);
  }

  @Post('/searchHashtagsBySearchString')
  searchHashtagsBySearchString(
    @Body() body: { searchString: string; page: number },
  ) {
    return this.postService.searchHashtagsBySearchString(body);
  }

  @Post('/deletePost')
  deletePost(@Body() body: { postId: string }, @Req() req) {
    return this.postService.deletePost(body, req);
  }

  @Post('/deleteComment')
  deleteComment(@Body() body: { commentId: string; postId: string }) {
    return this.postService.deleteComment(body);
  }

  @Post('/deleteCocomment')
  deleteCocomment(
    @Body() body: { cocommentId: string; commentId: string },
    @Req() req,
  ) {
    return this.postService.deleteCocomment(body, req);
  }

  @Post('/getCommentPageContent')
  getCommentPageContent(@Body() body: { postId: string }, @Req() req) {
    return this.postService.getCommentPageContent({
      postId: body.postId,
      userId: req.user.userId,
    });
  }
}
