import { Injectable, Logger } from '@nestjs/common';
import { Que } from 'sns-interfaces';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const amqp = require('amqplib');

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

  constructor(private queList: Que[]) {
    this.initialize([]);
  }

  async initialize(queList: Que[]) {
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    if (queList.length > 0) {
      queList.forEach(async (que) => {
        await this.channel.assertQueue(que, { durable: true });
        await this.channel.consume(
          que,
          //(message) => {
          //const targetQue: string = message.fields.routingKey;
          // if (targetQue === 'alert') {
          //   handleAlert(message);
          // }
          //},
          { noAck: true },
        );
      });
    }
    this.logger.log(
      `AMQP connected, ${queList.length > 0 ? queList : 'nothing'} asserted`,
    );
  }

  sendMsg(targetQue: string, msgForm: object): void {
    this.logger.log(`send message to ${targetQue}`);
    this.channel.sendToQueue(targetQue, Buffer.from(JSON.stringify(msgForm)));
  }
}
