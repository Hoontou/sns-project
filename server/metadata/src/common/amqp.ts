import { MetadataDto } from 'src/database/schema';
import { newMeatadata } from '../database/schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const amqp = require('amqplib');
const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

const handleMetadata = (message) => {
  const data: MetadataDto = JSON.parse(message.content.toString());
  //날라온 메세지 파싱
  console.log('metadata MSA catch metadata from upload');
  //console.log(data);
  newMeatadata(data); //몽고디비 저장 함수
};

class RabbitMQ {
  private conn;
  public channel;
  constructor(private rabbitUrl) {
    this.rabbitUrl = rabbitUrl;
  }

  async initialize(queList: string[]) {
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    queList.forEach(async (que) => {
      await this.channel.assertQueue(que, { durable: true });
      await this.channel.consume(
        que,
        (message) => {
          const targetQue: string = message.fields.routingKey;
          if (targetQue === 'metadata') {
            handleMetadata(message);
          }
        },
        { noAck: true },
      );
    });
    console.log('RabbitMQ connected');
  }
}

export const rabbitMQ = new RabbitMQ(RABBIT);
