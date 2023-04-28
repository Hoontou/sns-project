import { Injectable, Logger } from '@nestjs/common';
import { AmqpMessage, Que } from 'sns-interfaces';
import * as amqp from 'amqplib';

import { UsernumsTable } from 'src/user/repository/usernums.repository';

const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

@Injectable()
export class AmqpService {
  private logger = new Logger('RabbitMQ');
  private rabbitUrl = RABBIT;
  private conn;
  private channel;
  private que: Que;

  constructor(private usernumsTable: UsernumsTable) {
    this.initialize('user');
  }

  async initialize(whoAreU: Que) {
    this.que = whoAreU;
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();

    //내 이름 큐 생성, 컨슘까지 등록
    await this.channel.assertQueue(this.que, { durable: true });
    await this.registerConsume();

    //구독한 메세지 받아오는 익명큐 획득
    await this.channel.assertExchange(this.que, 'topic', { durable: true });
    const { anonQue } = this.channel.assertQueue('', {
      exclusive: true,
    });
    //업로드 MSA 구독하고 컨슘 등록까지
    await this.bindSubscribe(anonQue);

    this.logger.log(`AMQP connected, ${this.que} asserted`);
  }

  /**내 이름 큐에 대한 컨슘 등록 */
  async registerConsume() {
    await this.channel.consume(
      this.que,
      (message: AmqpMessage) => {
        const messageFrom: Que = message.properties.appId;
        console.log(`${this.que} MSA catch message from ${messageFrom}`);

        const data: unknown = JSON.parse(message.content.toString());
        if (message.properties.type === 'addFollow') {
          this.usernumsTable.addFollow(
            data as { userTo: string; userFrom: string },
          );
        }
      },
      { noAck: true },
    );
  }

  /**필요한 MSA 구독하고 컨슘 등록 */
  async bindSubscribe(que) {
    //MSA 구독 파트
    await this.channel.bindQueue(que, 'upload', 'upload');

    //구독한 큐에서 오는 메세지 컨슘 등록 파트
    await this.channel.consume(
      que,
      (msg: AmqpMessage) => {
        //console.log(msg);
        //exchange 출처 체크후 해당 핸들러로 전달
        if (msg.fields.exchange === 'upload') {
          this.uploadHandler(msg);
        }
      },
      { noAck: true },
    );
  }

  /**업로드 MSA에서 받아오는 메세지 핸들러 */
  async uploadHandler(msg) {
    //exchange가 upload인 메세지가 여기로 전달됨.
    //key 체크해서 해당 핸들러로 전달.

    const content = JSON.parse(msg.content.toString());
    if (msg.fields.routingKey == 'upload') {
      this.usernumsTable.addPostCount(content);
    }
  }

  publishMsg(key, msgForm) {
    this.channel.publish(this.que, key, Buffer.from(JSON.stringify(msgForm)));
  }
  sendMsg(targetQue: Que, msgForm: object, methodName: string): void {
    this.logger.log(`send message to ${targetQue}`);

    //메세지 보내는 메서드의 이름과 보내는 MSA 이름까지 등록해서 보냄.
    this.channel.sendToQueue(targetQue, Buffer.from(JSON.stringify(msgForm)), {
      appId: this.que,
      type: methodName,
    });
  }
}
