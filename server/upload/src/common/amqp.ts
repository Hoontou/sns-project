import { AlertDto, MetadataDto, PostMessage, Que } from 'sns-interfaces';
import * as amqp from 'amqplib';

const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

class RabbitMQ {
  private conn;
  private channel;
  private options: { appId: Que };
  constructor(private rabbitUrl) {}

  async initialize(whoAreU: Que, queList: Que[] = []) {
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    this.options = { appId: whoAreU };

    queList.forEach(async (que) => {
      await this.channel.assertQueue(que, { durable: true });
      // await this.channel.consume(
      //   que,
      //   (message) => {
      // const messageFrom: Que = message.properties.appId;
      // console.log(`${whoAreU} MSA catch message from ${messageFrom}`);
      //     if (targetQue === 'metadata') {
      //       handleMetadata(message);
      //     }
      //   },
      //   { noAck: true },
      // );
    });
    console.log('RabbitMQ connected');
  }

  sendMsg(targetQue: Que, msgForm: AlertDto | MetadataDto | PostMessage): void {
    this.channel.sendToQueue(
      targetQue,
      Buffer.from(JSON.stringify(msgForm)),
      this.options,
    );
  }
}
export const rabbitMQ = new RabbitMQ(RABBIT);
