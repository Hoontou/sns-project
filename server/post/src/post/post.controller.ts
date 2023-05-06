import { Controller } from '@nestjs/common';
import { PostService } from './post.service';
import { GrpcMethod } from '@nestjs/microservices';
import { PostTable } from './repository/post.repository';

@Controller('post')
export class PostController {
  constructor(private postService: PostService, private postTable: PostTable) {}

  @GrpcMethod('PostService', 'GetPostnums')
  getPostnums(data: {
    postId: string;
  }): Promise<{ likesCount: number; commentCount: number }> {
    return this.postTable.getPostnums(data.postId);
  }
}
