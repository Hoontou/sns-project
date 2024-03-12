import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { GrpcMethod } from '@nestjs/microservices';
import { PostContent } from 'sns-interfaces/client.interface';
import { PostTable } from './repository/post.table';
import { PostRepository } from './post.repo';
import { SearchService } from './search.service';

@Controller('post')
export class PostController {
  constructor(
    private postService: PostService,
    private postRepo: PostRepository,
    private searchService: SearchService,
  ) {}

  @GrpcMethod('PostService', 'GetPost')
  getPost(data: { postId: string }): Promise<PostContent | undefined> {
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

  @GrpcMethod('PostService', 'GetPostsIdsByHashtag')
  getPostsIdsByHashtag(data: { hashtag: string; page: number }) {
    return this.searchService.getPostsIdsByHashtag(data);
  }

  @GrpcMethod('PostService', 'SearchPostIdsBySearchString')
  searchPostsIdsByString(data: { searchString: string; page: number }) {
    return this.searchService.searchPostIdsBySearchString(data);
  }

  @GrpcMethod('PostService', 'SearchHashtagsBySearchString')
  searchHashtagsBySearchString(data: { searchString: string; page: number }) {
    return this.searchService.searchHashtagsBySearchString(data);
  }

  @GrpcMethod('PostService', 'getComment')
  getComment(data: { commentId: number }) {
    return this.postRepo.commentTable.getComment(data);
  }

  @GrpcMethod('PostService', 'getCocomment')
  getCocomment(data: { cocommentId: number }) {
    return this.postRepo.cocommentTable.getCocomment(data);
  }
}
