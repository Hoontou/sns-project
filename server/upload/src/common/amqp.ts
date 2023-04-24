import { Que } from 'sns-interfaces';
import * as amqp from 'amqplib';

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
  }

  publishMsg(key, msgForm) {
    this.channel.publish(this.que, key, Buffer.from(JSON.stringify(msgForm)));
  }
}
export const rabbitMQ = new RabbitMQ(RABBIT);
