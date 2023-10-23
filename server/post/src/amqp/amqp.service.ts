import { Injectable, Logger } from '@nestjs/common';
import { AmqpMessage, Que } from 'sns-interfaces';
import * as amqp from 'amqplib';
import { ExchangeHandler } from './handler/exchange.handler';
import { PostHandler } from './handler/post.handler';

const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

@Injectable()
export class AmqpService {
  private logger = new Logger('RabbitMQ');
  private rabbitUrl = RABBIT;
  private conn;
  private channel;
  private que: Que;

  constructor(
    private exchangeHandler: ExchangeHandler,
    private postHandler: PostHandler,
  ) {
    this.initialize('post');
  }

  /**초기연결설정, 큐생성, 구독, 컨슘등록 */
  async initialize(whoAreU: Que) {
    this.que = whoAreU;
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();

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

    this.logger.log(`AMQP connected, ${this.que} asserted`);
  }

  /**내 이름 큐에 대한 컨슘 등록 */
  async setConsume() {
    await this.channel.consume(
      this.que,
      (msg: AmqpMessage) => {
        //핸들러로 전달
        this.postHandler.consumeMessage(msg);
      },
      { noAck: true },
    );
  }

  /**exchange 구독과 익명큐 컨슘 등록 */
  async bindExchanges(anonQue) {
    //MSA 구독 파트
    await this.channel.bindQueue(anonQue, 'upload', 'upload');
    await this.channel.bindQueue(anonQue, 'gateway', 'addLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'removeLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'addCommentLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'removeCommentLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'addCocommentLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'removeCocommentLike');
    await this.channel.bindQueue(anonQue, 'gateway', 'deletePost');

    //구독한 큐에서 오는 메세지 컨슘 등록 파트
    await this.channel.consume(
      anonQue,
      (msg: AmqpMessage) => {
        //핸들러로 전달
        this.exchangeHandler.consumeMessage(msg);
      },
      { noAck: true },
    );
  }

  /**메세지 퍼블리시한다. 라우팅키, 메세지*/
  publishMsg(key, msgForm) {
    this.channel.publish(this.que, key, Buffer.from(JSON.stringify(msgForm)));
  }

  /**메세지 보낼 큐, 메세지, 메세지 보내는 메서드 이름 */
  sendMsg(
    targetQue: Que,
    msgForm: { [key: string]: any },
    methodName: string,
  ): void {
    this.logger.log(`${methodName} sends message to ${targetQue}`);

    //메세지 보내는 메서드의 이름과 보내는 MSA 이름까지 등록해서 보냄.
    //메세지의 타입을 보내는 메서드이름으로 해서 받는곳에서 알아먹을수 있게한다.
    this.channel.sendToQueue(targetQue, Buffer.from(JSON.stringify(msgForm)), {
      appId: this.que,
      type: methodName,
    });
  }
}
