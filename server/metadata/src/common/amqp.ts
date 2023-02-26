import { MetadataDto } from 'src/database/schema';
import { newMeatadata } from '../database/schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const amqp = require('amqplib');
const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

// export const createMQProducer = (queueName: string) => {
//   console.log('Connecting to RabbitMQ...');
//   let ch: any;
//   amqp.connect(RABBIT, (errorConnect: Error, connection) => {
//     if (errorConnect) {
//       console.log('Error connecting to RabbitMQ: ', errorConnect);
//       return;
//     }

//     connection.createChannel(async (errorChannel, channel) => {
//       if (errorChannel) {
//         console.log('Error creating channel: ', errorChannel);
//         return;
//       }

//       ch = channel;
//       await channel.assertQueue(queueName, { durable: true });
//       console.log('Connected to RabbitMQ');
//     });
//   });
//   return (msg: string) => {
//     console.log('Produce message to RabbitMQ...');
//     ch.sendToQueue(queueName, Buffer.from(msg));
//   };
// };

// const initializeRabbit = async (queList: string[]) => {
//   const conn = await amqp.connect(RABBIT);
//   const channel = await conn.createChannel();
//   queList.forEach(async (que) => {
//     await channel.assertQueue(que, { durable: true });
//     await channel.consume(
//       que,
//       (message) => {
//         console.log(" [x] Received '%s'", message.content.toString());
//       },
//       { noAck: true },
//     );
//   });
//   console.log('RabbitMQ connected');
//   return channel;
// };
// export const rabbit = initializeRabbit(['metadata', 'alert']);

//위는 리팩토링 전 함수형
//아래는 리팩토링 후 객체형

const handleMetadata = (message) => {
  const data: MetadataDto = JSON.parse(message.content.toString());
  console.log('metadata MSA catch metadata from upload');
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
