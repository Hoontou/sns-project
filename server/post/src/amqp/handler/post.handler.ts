import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { AmqpMessage } from 'sns-interfaces';
import { PostService } from 'src/post/post.service';

@Injectable()
export class PostHandler {
  private logger = new Logger(PostHandler.name);
  constructor(
    @Inject(forwardRef(() => PostService)) private postService: PostService,
  ) {}

  consumeMessage(msg: AmqpMessage) {
    this.logger.log(`catch msg from ${msg.properties.appId}`);

    const data: unknown = JSON.parse(msg.content.toString());
    //메세지보낸 MSA(큐)이름, 보낸 메서드 확인가능.
    //const messageFrom: Que = msg.properties.appId;
    //const methodFrom = msg.properties.type
    if (msg.properties.type === 'addComment') {
      this.postService.addComment(
        data as { userId: string; postId: string; comment: string },
      );
      return;
    }
    if (msg.properties.type === 'addCocomment') {
      this.postService.addCocomment(
        data as { userId: string; commentId: number; cocomment: string },
      );
      return;
    }
  }
}
