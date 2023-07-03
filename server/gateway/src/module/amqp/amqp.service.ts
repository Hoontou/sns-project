import { Injectable, Logger } from '@nestjs/common';
import { Que } from 'sns-interfaces';

import * as amqp from 'amqplib';

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

  constructor() {
    this.initialize('gateway');
  }

  async initialize(whoAreU: Que) {
    this.que = whoAreU;
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();

    //내 MSA이름으로 퍼블리시 할 큐 생성
    await this.channel.assertExchange(this.que, 'topic', { durable: true });

    this.logger.log(`AMQP connected, ${this.que} asserted`);
  }

  /**메세지 퍼블리시한다. 라우팅키, 메세지*/
  publishMsg(key, msgForm) {
    this.channel.publish(this.que, key, Buffer.from(JSON.stringify(msgForm)));
  }

  /**메세지 보낼 큐, 메세지, 메세지 보내는 메서드 이름 */
  sendMsg(
    targetQue: Que,
    msgForm: { [key: string]: any },
    methodName: string,
  ): void {
    this.logger.log(`${methodName} sends message to ${targetQue}`);

    //메세지 보내는 메서드의 이름과 보내는 MSA 이름까지 등록해서 보냄.
    //메세지의 타입을 보내는 메서드이름으로 해서 받는곳에서 알아먹을수 있게한다.
    this.channel.sendToQueue(targetQue, Buffer.from(JSON.stringify(msgForm)), {
      appId: this.que,
      type: methodName,
    });
  }
}
