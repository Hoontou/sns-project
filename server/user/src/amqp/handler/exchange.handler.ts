import { Injectable, Logger } from '@nestjs/common';
import { AmqpMessage, UploadMessage } from 'sns-interfaces';
import { UsernumsTable } from 'src/user/repository/usernums.repository';

@Injectable()
export class ExchangeHandler {
  private logger = new Logger(ExchangeHandler.name);
  constructor(private usernumsTable: UsernumsTable) {}

  consumeMessage(msg: AmqpMessage) {
    this.logger.log(
      `catch msg from ${msg.fields.exchange}:${msg.fields.routingKey}`,
    );

    //exchange에 따라 각각의 핸들러로 보낸다.
    if (msg.fields.exchange === 'upload') {
      this.uploadHandler(msg);
    }
  }

  /**업로드 MSA에서 받아오는 메세지 핸들러 */
  async uploadHandler(msg) {
    //exchange가 upload인 메세지가 여기로 전달됨.
    //key 체크해서 해당 핸들러로 전달.

    const data: unknown = JSON.parse(msg.content.toString());

    if (msg.fields.routingKey == 'upload') {
      this.usernumsTable.addPostCount(data as UploadMessage);
    }
  }
}
