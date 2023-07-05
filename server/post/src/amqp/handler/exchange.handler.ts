import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { AmqpMessage, UploadMessage } from 'sns-interfaces';
import { PostService } from 'src/post/post.service';
import { CoCommentTable } from 'src/post/repository/cocomment.table';
import { CommentTable } from 'src/post/repository/comment.table';
import { PostTable } from 'src/post/repository/post.table';

@Injectable()
export class ExchangeHandler {
  private logger = new Logger(ExchangeHandler.name);
  constructor(
    @Inject(forwardRef(() => PostService)) private postService: PostService,
    private postTable: PostTable,
    private commentTable: CommentTable,
    private cocommentTable: CoCommentTable,
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
      return this.postTable.addLike(data as { postId: string });
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
    if (msg.fields.routingKey === 'addCocommentLike') {
      this.cocommentTable.addLike(data as { cocommentId: number });
      return;
    }
    if (msg.fields.routingKey === 'removeCocommentLike') {
      this.cocommentTable.removeLike(data as { cocommentId: number });
      return;
    }
  }
}
