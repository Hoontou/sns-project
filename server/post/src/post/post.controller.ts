import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { GrpcMethod } from '@nestjs/microservices';
import { PostTable } from './repository/post.repository';
import { PostContent } from 'sns-interfaces/client.interface';
import { CommentTable } from './repository/comment.repository';
import { CoCommentTable } from './repository/cocomment.repository';

@Controller('post')
export class PostController {
  constructor(
    private postService: PostService,
    private postTable: PostTable,
    private commentTable: CommentTable,
    private cocommentTable: CoCommentTable,
  ) {}

  @GrpcMethod('PostService', 'GetPost')
  getPostnums(data: { postId: string }): Promise<PostContent> {
    return this.postTable.getPost(data.postId);
  }

  @GrpcMethod('PostService', 'GetCommentList')
  getCommentList(data: { postId: string; page: number }) {
    return this.postService.getCommentList(data);
  }

  @GrpcMethod('PostService', 'GetCocommentList')
  getCocommentList(data: { commentId: number; page: number }) {
    return this.postService.getCocommentList(data);
  }
}
