import { Injectable, Logger } from '@nestjs/common';
import { AmqpMessage } from 'sns-interfaces';

@Injectable()
export class PostHandler {
  private logger = new Logger(PostHandler.name);

  consumeMessage(msg: AmqpMessage) {
    this.logger.log(`catch msg from ${msg.properties.appId}`);

    const data: unknown = JSON.parse(msg.content.toString());
    //메세지보낸 MSA(큐)이름, 보낸 메서드 확인가능.
    //const messageFrom: Que = msg.properties.appId;
    //const methodFrom = msg.properties.type
  }
}
