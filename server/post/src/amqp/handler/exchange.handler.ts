import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { AmqpMessage, UploadMessage } from 'sns-interfaces';
import { PostService } from 'src/post/post.service';
import { CommentTable } from 'src/post/repository/comment.repository';
import { PostTable } from 'src/post/repository/post.repository';

@Injectable()
export class ExchangeHandler {
  private logger = new Logger(ExchangeHandler.name);
  constructor(
    @Inject(forwardRef(() => PostService)) private postService: PostService,
    private postTable: PostTable,
    private commentTable: CommentTable,
  ) {}

  consumeMessage(msg: AmqpMessage) {
    this.logger.log(
      `catch msg from ${msg.fields.exchange}:${msg.fields.routingKey}`,
    );

    //exchange에 따라 각각의 핸들러로 보낸다.
    if (msg.fields.exchange === 'upload') {
      this.uploadHandler(msg);
      return;
    }
    if (msg.fields.exchange === 'gateway') {
      this.gatewayHandler(msg);
      return;
    }
  }

  uploadHandler(msg: AmqpMessage) {
    //exchange가 upload인 메세지가 여기로 전달됨.
    //라우팅키 체크해서 해당 핸들러로 전달.
    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.fields.routingKey == 'upload') {
      this.postService.posting(data as UploadMessage);
      return;
    }
  }

  gatewayHandler(msg: AmqpMessage) {
    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.fields.routingKey === 'addLike') {
      this.postTable.addLike(data as { postId: string });
      return;
    }
    if (msg.fields.routingKey === 'removeLike') {
      this.postTable.removeLike(data as { postId: string });
      return;
    }
    if (msg.fields.routingKey === 'addCommentLike') {
      this.commentTable.addLike(data as { commentId: number });
      return;
    }
    if (msg.fields.routingKey === 'removeCommentLike') {
      this.commentTable.removeLike(data as { commentId: number });
      return;
    }
  }
}
