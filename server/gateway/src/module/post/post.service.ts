import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CommentItemContent, PostContent } from 'sns-interfaces';
import { PostGrpcService } from 'src/grpc/grpc.services';
import { FflService } from '../ffl/ffl.service';

@Injectable()
export class PostService {
  private postGrpcService: PostGrpcService;
  constructor(
    @Inject('post') private client: ClientGrpc,
    private fflService: FflService,
  ) {}
  onModuleInit() {
    this.postGrpcService =
      this.client.getService<PostGrpcService>('PostService');
  }
  async getPost(postId: string): Promise<PostContent> {
    return lastValueFrom(this.postGrpcService.getPost({ postId }));
  }

  async getCommentItem(body: { postId: string; page: number }, userId: string) {
    const { comments } = await lastValueFrom(
      this.postGrpcService.getCommentList({
        postId: body.postId,
        page: body.page,
      }),
    );
    const { commentLikedList } = await this.fflService.getCommentLiked({
      commentIdList: comments.map((i) => {
        return i.commentId;
      }),
      userId,
    });
    const commentItem: CommentItemContent[] = comments.map((item, index) => {
      return { ...item, page: 0, liked: commentLikedList[index] };
    });
    return { commentItem };
  }
}
