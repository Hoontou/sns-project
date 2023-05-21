import * as amqp from 'amqplib';
import { AmqpMessage, Que } from 'sns-interfaces';
import { msgHandler } from './handler/handler';
import { exchangeHandler } from './handler/exchange.handler';

const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

class RabbitMQ {
  private conn;
  private channel;
  private que;
  constructor(private rabbitUrl) {}

  async initialize(whoAreU: Que) {
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    this.que = whoAreU;

    //내 MSA 이름으로 된 큐 생성
    await this.channel.assertQueue(this.que, { durable: true });
    //내 MSA이름으로 퍼블리시 할 큐 생성
    await this.channel.assertExchange(this.que, 'topic', { durable: true });
    //내가 구독한 exchange를 가져올 익명큐 생성.
    const { anonQue } = this.channel.assertQueue('', {
      exclusive: true,
    });

    //내 이름으로 오는 메세지 컨슘 등록
    this.setConsume();
    //exchange 구독과 익명큐 컨슘 등록
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
        //핸들러로 전달
        msgHandler(msg);
      },
      { noAck: true },
    );
  }

  async bindExchanges(anonQue) {
    //MSA 구독 파트
    await this.channel.bindQueue(anonQue, 'gateway', 'addLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'removeLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'addCommentLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'removeCommentLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'addCocommentLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'removeCocommentLike');

    //구독한 큐에서 오는 메세지 컨슘 등록 파트
    await this.channel.consume(
      anonQue,
      (msg) => {
        console.log(
          `catch msg from ${msg.fields.exchange}:${msg.fields.routingKey}`,
        );

        //console.log(msg);

        exchangeHandler(msg);
      },
      { noAck: true },
    );
  }

  /**메세지 보낼 큐, 메세지, 메세지 보내는 메서드 이름 */
  sendMsg(
    targetQue: Que,
    msgForm: { [key: string]: any },
    methodName: string,
  ): void {
    console.log(`${methodName} sends message to ${targetQue}`);

    //메세지 보내는 메서드의 이름과 보내는 MSA 이름까지 등록해서 보냄.
    //메세지의 타입을 보내는 메서드이름으로 해서 받는곳에서 알아먹을수 있게한다.
    this.channel.sendToQueue(targetQue, Buffer.from(JSON.stringify(msgForm)), {
      appId: this.que,
      type: methodName,
    });
  }
}

export const rabbitMQ = new RabbitMQ(RABBIT);
