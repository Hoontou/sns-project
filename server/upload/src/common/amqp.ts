// eslint-disable-next-line @typescript-eslint/no-var-requires
const amqp = require('amqplib');
const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

class RabbitMQ {
  private conn;
  private channel;
  constructor(private rabbitUrl) {
    this.rabbitUrl = rabbitUrl;
  }

  async initialize(queList: string[]) {
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    queList.forEach(async (que) => {
      await this.channel.assertQueue(que, { durable: true });
      // await this.channel.consume(
      //   que,
      //   (message) => {
      //     const targetQue: string = message.fields.routingKey;
      //     if (targetQue === 'metadata') {
      //       handleMetadata(message);
      //     }
      //   },
      //   { noAck: true },
      // );
    });
    console.log('RabbitMQ connected');
  }

  sendMsg(targetQue: string, msgForm: object): void {
    this.channel.sendToQueue(targetQue, Buffer.from(JSON.stringify(msgForm)));
  }
}
export const rabbitMQ = new RabbitMQ(RABBIT);
