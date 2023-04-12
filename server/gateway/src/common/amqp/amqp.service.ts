import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
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
  private options: { appId: Que };

  constructor() {
    this.initialize('gateway', ['gateway']);
  }

  async initialize(whoAreU: Que, queList: Que[]) {
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    this.options = { appId: whoAreU };
    if (queList.length > 0) {
      queList.forEach(async (que) => {
        await this.channel.assertQueue(que, { durable: true });
        await this.channel.consume(
          que,
          (message) => {
            const messageFrom: Que = message.properties.appId;
            this.logger.log(`${whoAreU} MSA catch message from ${messageFrom}`);

            // if (data.type == 'PostDto') {
            //   this.postService.posting(data.content);
            // }
            // const targetQue: string = message.fields.routingKey;
            // if (targetQue === 'alert') {
            //   handleAlert(message);
            // }
          },
          { noAck: true },
        );
      });
    }
    this.logger.log(
      `AMQP connected, ${queList.length > 0 ? queList : 'nothing'} asserted`,
    );
  }

  sendMsg(targetQue: Que, msgForm: object): void {
    this.logger.log(`send message to ${targetQue}`);
    this.channel.sendToQueue(
      targetQue,
      Buffer.from(JSON.stringify(msgForm)),
      this.options,
    );
  }
}
