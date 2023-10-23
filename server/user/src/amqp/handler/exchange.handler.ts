import { Injectable, Logger } from '@nestjs/common';
import { AmqpMessage, UploadMessage } from 'sns-interfaces';
import { UserRepository } from 'src/user/user.repo';
// import { UserinfoTable } from 'src/user/repository/userinfo.repository';

@Injectable()
export class ExchangeHandler {
  private logger = new Logger(ExchangeHandler.name);
  constructor(private userRepo: UserRepository) {}

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

  /**업로드 MSA에서 받아오는 메세지 핸들러 */
  async uploadHandler(msg) {
    //exchange가 upload인 메세지가 여기로 전달됨.
    //key 체크해서 해당 핸들러로 전달.

    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.fields.routingKey == 'upload') {
      this.userRepo.addPostCount(data as UploadMessage);
      return;
    }
  }

  gatewayHandler(msg: AmqpMessage) {
    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.fields.routingKey === 'deletePost') {
      return this.userRepo.decreasePostCount({
        ...(data as { postId: string; userId: string }),
      });
    }
  }
}
