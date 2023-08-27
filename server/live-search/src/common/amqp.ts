import { Que } from 'sns-interfaces';

import * as amqp from 'amqplib';
import { uploadHandler } from './handler/upload.handler';

const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

class RabbitMQ {
  private conn;
  private channel;
  private que: Que;
  constructor(private rabbitUrl) {}

  async initialize(whoAreU: Que) {
    this.que = whoAreU;
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    await this.channel.assertExchange(this.que, 'topic', { durable: true });

    const { anonQue } = this.channel.assertQueue('', {
      exclusive: true,
    });
    await this.bindUpload(anonQue);

    await this.channel.consume(anonQue, (msg) => {
      //console.log(msg);
      //exchange 출처 체크후 해당 핸들러로 전달
      if (msg.fields.exchange === 'upload') {
        uploadHandler(msg);
      }
    });
    console.log('RabbitMQ connected');
  }

  async bindUpload(que) {
    await this.channel.bindQueue(que, 'upload', 'upload');
  }

  publishMsg(key, msgForm) {
    this.channel.publish(this.que, key, Buffer.from(JSON.stringify(msgForm)));
  }
}

export const rabbitMQ = new RabbitMQ(RABBIT);
