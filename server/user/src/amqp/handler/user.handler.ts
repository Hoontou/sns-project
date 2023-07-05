import { Injectable, Logger } from '@nestjs/common';
import { AmqpMessage } from 'sns-interfaces';
import { UserRepository } from 'src/user/user.repo';

@Injectable()
export class UserHandler {
  private logger = new Logger(UserHandler.name);
  constructor(private userRepo: UserRepository) {}

  consumeMessage(msg: AmqpMessage) {
    this.logger.log(`catch msg from ${msg.properties.appId}`);

    //const messageFrom: Que = msg.properties.appId; 메세지보낸 MSA(큐)이름
    // const methodFrom = msg.properties.type 보낸 메서드

    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.properties.type === 'addFollow') {
      this.userRepo.addFollow(data as { userTo: string; userFrom: string });
      return;
    }
    if (msg.properties.type === 'removeFollow') {
      this.userRepo.removeFollow(data as { userTo: string; userFrom: string });
      return;
    }
    //유저 프사 수정요청
    if (msg.properties.type === 'uploadUserImg') {
      this.userRepo.setImg(data as { userId: string; img: string });
    }
  }
}
