import * as amqp from 'amqplib';
import { Que } from 'sns-interfaces';
import { msgHandler } from './handler/handler';

const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

// const handleMetadata = (message) => {
//   const data: MetadataDto = JSON.parse(message.content.toString());
//   //날라온 메세지 파싱
//   console.log('metadata MSA catch metadata from upload');
//   newMeatadata(data); //몽고디비 저장 함수
// };

class RabbitMQ {
  private conn;
  private channel;
  private que;
  constructor(private rabbitUrl) {}

  async initialize(whoAreU: Que) {
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    this.que = whoAreU;

    await this.channel.assertQueue(this.que, { durable: true });
    await this.channel.consume(
      this.que,
      (message) => {
        const messageFrom: Que = message.properties.appId;
        console.log(`${this.que} MSA catch message from ${messageFrom}`);
        msgHandler(message);
      },
      { noAck: true },
    );

    console.log('RabbitMQ connected');
  }

  sendMsg(targetQue: Que, msgForm: object, methodName: string): void {
    this.channel.sendToQueue(targetQue, Buffer.from(JSON.stringify(msgForm)), {
      appId: this.que,
      type: methodName,
    });
  }
}

export const rabbitMQ = new RabbitMQ(RABBIT);
