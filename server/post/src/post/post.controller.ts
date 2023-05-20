import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { GrpcMethod } from '@nestjs/microservices';
import { PostTable } from './repository/post.repository';
import { PostContent } from 'sns-interfaces';
import { CommentTable } from './repository/comment.repository';

@Controller('post')
export class PostController {
  constructor(
    private postService: PostService,
    private postTable: PostTable,
    private commentTable: CommentTable,
  ) {}

  @GrpcMethod('PostService', 'GetPost')
  getPostnums(data: { postId: string }): Promise<PostContent> {
    return this.postTable.getPost(data.postId);
  }

  @GrpcMethod('PostService', 'GetCommentList')
  getCommentList(data: { postId: string; page: number }) {
    return this.postService.getCommentList(data);
  }

  // @Post('/getcommentlist')
  // getCommentList(@Body() body: { postId: string }) {
  //   return this.postService.getCommentList(body.postId);
  // }

  @Post('/addcomment')
  addComment(
    @Body() body: { postId: string; userId: string; comment: string },
  ) {
    return this.commentTable.addComment(body);
  }
}
