import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { GrpcMethod } from '@nestjs/microservices';
import { PostContent } from 'sns-interfaces/client.interface';
import { PostTable } from './repository/post.table';
import { PostRepository } from './post.repo';

@Controller('post')
export class PostController {
  constructor(
    private postService: PostService,
    private postRepo: PostRepository,
  ) {}

  @GrpcMethod('PostService', 'GetPost')
  getPost(data: { postId: string }): Promise<PostContent> {
    return this.postRepo.getPost(data);
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
