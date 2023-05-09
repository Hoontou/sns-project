import { Controller } from '@nestjs/common';
import { PostService } from './post.service';
import { GrpcMethod } from '@nestjs/microservices';
import { PostTable } from './repository/post.repository';
import { PostContent } from 'sns-interfaces';

@Controller('post')
export class PostController {
  constructor(private postService: PostService, private postTable: PostTable) {}

  @GrpcMethod('PostService', 'GetPost')
  getPostnums(data: { postId: string }): Promise<PostContent> {
    return this.postTable.getPost(data.postId);
  }
}
