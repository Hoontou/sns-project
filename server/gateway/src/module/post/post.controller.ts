import { Body, Controller, Post, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CommentItemContent } from 'sns-interfaces';
import {
  CocommentContent,
  PostFooterContent,
} from 'sns-interfaces/client.interface';
import { MetadataDto } from '../metadata/repository/metadata.collection';
import { ExReq } from '../auth/auth.middleware';
import { crypter } from 'src/common/crypter';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('/addcomment')
  addComment(
    @Body() body: { postId: string; comment: string; postOwnerUserId: string },
    @Req() req: ExReq,
  ) {
    return this.postService.addComment({ ...body, userId: req.user.userId });
  }

  @Post('/addcocomment')
  addCocomment(
    @Body()
    body: { commentId: number; cocomment: string; commentOwnerUserId: string },
    @Req() req: ExReq,
  ) {
    return this.postService.addCocomment({ ...body, userId: req.user.userId });
  }

  @Post('/getcommentlist')
  getCommentList(
    @Body() body: { postId: string; page: number },
    @Req() req: ExReq,
  ): Promise<{ commentItem: CommentItemContent[] }> {
    return this.postService.getCommentList(body, req.user.userId);
  }
  @Post('/getcomment')
  getComment(
    @Body() body: { commentId: number },
    @Req() req: ExReq,
  ): Promise<{
    commentItem: CommentItemContent[] | undefined;
    userId: string;
  }> {
    return this.postService.getComment({
      commentId: body.commentId,
      userId: req.user.userId,
    });
  }

  @Post('/getcocommentlist')
  getCocommentList(
    @Body() body: { commentId: number; page: number },
    @Req() req: ExReq,
  ): Promise<{ cocommentItem: CocommentContent[] }> {
    return this.postService.getCocommentList(body, req.user.userId);
  }

  @Post('/getHighlightCocomment')
  getHighlightCocomment(
    @Body() body: { cocommentId: number },
    @Req() req: ExReq,
  ): Promise<{
    cocommentItem: CocommentContent[];
    commentItem: CommentItemContent[];
  }> {
    return this.postService.getHighlightCocomment({
      ...body,
      userId: req.user.userId,
    });
  }

  @Post('/getpostsbyhashtag')
  getPostsByHashtag(
    @Body() body: { hashtag: string; page: number },
    @Req() req: ExReq,
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

  @Post('/deletePost')
  deletePost(@Body() body: { postId: string }, @Req() req: ExReq) {
    return this.postService.deletePost(body, req);
  }

  @Post('/deleteComment')
  deleteComment(@Body() body: { commentId: string; postId: string }) {
    return this.postService.deleteComment(body);
  }

  @Post('/deleteCocomment')
  deleteCocomment(@Body() body: { cocommentId: string; commentId: string }) {
    return this.postService.deleteCocomment(body);
  }

  @Post('/getCommentPageContent')
  getCommentPageContent(@Body() body: { postId: string }, @Req() req: ExReq) {
    return this.postService.getCommentPageContent({
      postId: body.postId,
      userId: req.user.userId,
    });
  }

  @Post('/postfooter')
  /**게시글 좋아요 했나?, 게시글에 달린 좋아요수, 댓글수 리턴해야함. */
  async postFooter(
    @Body() body: { postId: string; targetId: string },
    @Req() req: ExReq,
  ): Promise<PostFooterContent> {
    return this.postService.getPostFooter({
      ...body,
      userId: req.user.userId,
      targetUserId: crypter.decrypt(body.targetId),
    });
  }
}
