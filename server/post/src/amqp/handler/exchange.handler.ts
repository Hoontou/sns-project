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
      this.uploadHandler(msg);
    }
  }

  uploadHandler(msg: AmqpMessage) {
    //exchange가 upload인 메세지가 여기로 전달됨.
    //라우팅키 체크해서 해당 핸들러로 전달.
    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.fields.routingKey == 'upload') {
      this.postService.posting(data as UploadMessage);
    }
  }
}
