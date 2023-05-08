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

    //내 MSA이름으로 퍼블리시 할 큐 생성
    await this.channel.assertExchange(this.que, 'topic', { durable: true });
    console.log('RabbitMQ connected');
  }

  /**메세지 퍼블리시한다. 라우팅키, 메세지*/
  publishMsg(key, msgForm) {
    this.channel.publish(this.que, key, Buffer.from(JSON.stringify(msgForm)));
  }
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
