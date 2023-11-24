import { AmqpMessage, Que } from 'sns-interfaces';
import * as amqp from 'amqplib';
import { msgHandler, uploadHandler } from './handler/msg.handler';

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
    // 내 MSA이름으로 퍼블리시 할 큐 생성, 알람서버는 필요없을듯?
    // await this.channel.assertExchange(this.que, 'topic', { durable: true });

    //구독한 메세지 받아올 익명큐 생성
    const { anonQue } = this.channel.assertQueue('', {
      exclusive: true,
    });
    //내 MSA 이름으로 된 큐 생성
    await this.channel.assertQueue(this.que, { durable: true });

    //내 이름으로 오는 메세지 컨슘 등록
    await this.setConsume();

    //구독한 exchange를 익명큐에 바인드
    await this.bindExchanges(anonQue);

    console.log('RabbitMQ connected');
  }

  /**내 이름 큐에 대한 컨슘 등록 */
  async setConsume() {
    await this.channel.consume(
      this.que,
      (msg: AmqpMessage) => {
        console.log(
          `${this.que} MSA catch message from ${msg.properties.appId}`,
        );
        // console.log(msg);

        //핸들러로 전달
        msgHandler({
          method: msg.properties.type,
          whereFrom: msg.properties.appId,
          content: JSON.parse(msg.content.toString()),
        });
      },
      { noAck: true },
    );
  }

  async bindExchanges(anonQue) {
    await this.channel.bindQueue(anonQue, 'upload', 'upload');

    //구독한 큐에서 오는 메세지 컨슘 등록
    await this.channel.consume(
      anonQue,
      (msg) => {
        console.log(
          `catch msg from ${msg.fields.exchange}:${msg.fields.routingKey}`,
        );

        console.log(msg);

        //exchange 출처 체크후 해당 핸들러로 전달
        if (msg.fields.exchange === 'upload') {
          uploadHandler(msg);
        }
      },
      { noAck: true },
    );
  }

  publishMsg(key, msgForm) {
    this.channel.publish(this.que, key, Buffer.from(JSON.stringify(msgForm)));
  }
}

export const rabbitMQ = new RabbitMQ(RABBIT);
