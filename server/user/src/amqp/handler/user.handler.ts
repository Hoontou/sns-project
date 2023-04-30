import { Injectable, Logger } from '@nestjs/common';
import { AmqpMessage } from 'sns-interfaces';
import { UsernumsTable } from 'src/user/repository/usernums.repository';

@Injectable()
export class UserHandler {
  private logger = new Logger(UserHandler.name);
  constructor(private usernumsTable: UsernumsTable) {}

  consumeMessage(msg: AmqpMessage) {
    this.logger.log(`catch msg from ${msg.properties.appId}`);

    //const messageFrom: Que = msg.properties.appId; 메세지보낸 MSA(큐)이름
    //const methodFrom = msg.properties.type 보낸 메서드

    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.properties.type === 'addFollow') {
      this.usernumsTable.addFollow(
        data as { userTo: string; userFrom: string },
      );
    }
    if (msg.properties.type === 'removeFollow') {
      this.usernumsTable.removeFollow(
        data as { userTo: string; userFrom: string },
      );
    }
  }
}
