import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { AmqpMessage, UploadMessage } from 'sns-interfaces';
import { PostService } from 'src/post/post.service';

@Injectable()
export class ExchangeHandler {
  private logger = new Logger(ExchangeHandler.name);
  constructor(
    @Inject(forwardRef(() => PostService)) private postService: PostService,
  ) {}

  consumeMessage(msg: AmqpMessage) {
    this.logger.log(
      `catch msg from ${msg.fields.exchange}:${msg.fields.routingKey}`,
    );

    //exchange에 따라 각각의 핸들러로 보낸다.
    if (msg.fields.exchange === 'upload') {
      return this.uploadHandler(msg);
    }
    if (msg.fields.exchange === 'gateway') {
      return this.gatewayHandler(msg);
    }
  }

  uploadHandler(msg: AmqpMessage) {
    //exchange가 upload인 메세지가 여기로 전달됨.
    //라우팅키 체크해서 해당 핸들러로 전달.
    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.fields.routingKey == 'upload') {
      return this.postService.posting(data as UploadMessage);
    }
  }

  gatewayHandler(msg: AmqpMessage) {
    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.fields.routingKey === 'addLike') {
      return this.postService.addLike({
        ...(data as { postId: string }),
        type: 'post',
      });
    }
    if (msg.fields.routingKey === 'addCommentLike') {
      return this.postService.addLike({
        ...(data as { commentId: number }),
        type: 'comment',
      });
    }
    if (msg.fields.routingKey === 'addCocommentLike') {
      return this.postService.addLike({
        ...(data as { cocommentId: number }),
        type: 'cocomment',
      });
    }
    if (msg.fields.routingKey === 'removeLike') {
      return this.postService.removeLike({
        ...(data as { postId: string }),
        type: 'post',
      });
    }
    if (msg.fields.routingKey === 'removeCommentLike') {
      return this.postService.removeLike({
        ...(data as { commentId: number }),
        type: 'comment',
      });
    }
    if (msg.fields.routingKey === 'removeCocommentLike') {
      return this.postService.removeLike({
        ...(data as { cocommentId: number }),
        type: 'cocomment',
      });
    }
    if (msg.fields.routingKey === 'deletePost') {
      return this.postService.deletePost({
        ...(data as { postId: string; userId: string }),
      });
    }
    if (msg.fields.routingKey === 'deleteComment') {
      return this.postService.deleteComment({
        ...(data as { commentId: string; postId: string }),
      });
    }
    if (msg.fields.routingKey === 'deleteCocomment') {
      return this.postService.deleteCocomment({
        ...(data as { cocommentId: string; commentId: string }),
      });
    }
  }
}
export type AddLikeType = AddLikePost | AddLikeComment | AddLikeCocomment;
export interface AddLikePost {
  postId: string;
  type: 'post';
}
export interface AddLikeComment {
  commentId: number;
  type: 'comment';
}
export interface AddLikeCocomment {
  cocommentId: number;
  type: 'cocomment';
}
