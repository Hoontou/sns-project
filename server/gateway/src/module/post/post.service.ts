import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CommentItemContent, PostContent } from 'sns-interfaces';
import { PostGrpcService } from 'src/grpc/grpc.services';
import { FflService } from '../ffl/ffl.service';
import { AmqpService } from 'src/common/amqp/amqp.service';

@Injectable()
export class PostService {
  private postGrpcService: PostGrpcService;
  constructor(
    @Inject('post') private client: ClientGrpc,
    private fflService: FflService,
    private amqpService: AmqpService,
  ) {}
  onModuleInit() {
    this.postGrpcService =
      this.client.getService<PostGrpcService>('PostService');
  }
  async getPost(postId: string): Promise<PostContent> {
    return lastValueFrom(this.postGrpcService.getPost({ postId }));
  }

  async getCommentList(body: { postId: string; page: number }, userId: string) {
    //id로 코멘트 다 가져옴
    const { comments } = await lastValueFrom(
      this.postGrpcService.getCommentList({
        postId: body.postId,
        page: body.page,
      }),
    );

    //가져온 코멘트 id로 좋아요눌렀나 체크
    const { commentLikedList } = await this.fflService.getCommentLiked({
      commentIdList: comments?.map((i) => {
        return i.commentId;
      }),
      userId,
    });

    //리턴할 코멘트들에 좋아요체크결과 붙여넣기
    const commentItem: CommentItemContent[] = comments?.map((item, index) => {
      return { ...item, liked: commentLikedList[index] };
    });
    return { commentItem };
  }

  async getCocommentList(
    body: { commentId: number; page: number },
    userId: string,
  ) {
    const { cocomments } = await lastValueFrom(
      this.postGrpcService.getCocommentList(body),
    );

    const { cocommentLikedList } = await this.fflService.getCocommentLiked({
      cocommentIdList: cocomments.map((i) => {
        return i.cocommentId;
      }),
      userId,
    });

    const cocommentItem = cocomments.map((item, index) => {
      return { ...item, liked: cocommentLikedList[index] };
    });
    return { cocommentItem };
  }

  async addComment(data: { userId: string; postId: string; comment: string }) {
    this.amqpService.sendMsg('post', data, 'addComment');
    return;
  }
  async addCocomment(data: {
    userId: string;
    commentId: number;
    cocomment: string;
  }) {
    this.amqpService.sendMsg('post', data, 'addCocomment');
    return;
  }
}
