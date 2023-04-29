import { Que } from 'sns-interfaces';
import * as amqp from 'amqplib';
import { exchangeHandler } from './handler/exchange.handler';

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

    //내가 구독한 exchange를 가져올 익명큐 생성.
    const { anonQue } = this.channel.assertQueue('', {
      exclusive: true,
    });
    await this.bindExchanges(anonQue);

    console.log('RabbitMQ connected');
  }

  async bindExchanges(anonQue) {
    //MSA 구독 파트
    await this.channel.bindQueue(anonQue, 'upload', 'upload');

    //구독한 큐에서 오는 메세지 컨슘 등록 파트
    await this.channel.consume(anonQue, (msg) => {
      console.log(
        `catch msg from ${msg.fields.exchange}:${msg.fields.routingKey}`,
      );

      //console.log(msg);

      exchangeHandler(msg);
    });
  }
}

export const rabbitMQ = new RabbitMQ(RABBIT);
