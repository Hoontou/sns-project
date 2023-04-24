import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Que } from 'sns-interfaces';
import { PostService } from '../../post/post.service';
import * as amqp from 'amqplib';

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
    @Inject(forwardRef(() => PostService)) private postService: PostService,
  ) {
    this.initialize('post');
  }

  async initialize(whoAreU: Que) {
    this.que = whoAreU;
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    await this.channel.assertExchange(this.que, 'topic', { durable: true });

    const { anonQue } = this.channel.assertQueue('', {
      exclusive: true,
    });
    await this.bindUpload(anonQue);

    await this.channel.consume(
      anonQue,
      (msg) => {
        //console.log(msg);
        //exchange 출처 체크후 해당 핸들러로 전달
        if (msg.fields.exchange === 'upload') {
          this.uploadHandler(msg);
        }
      },
      { noAck: true },
    );

    this.logger.log(`AMQP connected, ${this.que} asserted`);
  }

  async bindUpload(que) {
    await this.channel.bindQueue(que, 'upload', 'upload');
  }

  uploadHandler(msg) {
    //exchange가 upload인 메세지가 여기로 전달됨.
    //key 체크해서 해당 핸들러로 전달.

    const content = JSON.parse(msg.content.toString());
    if (msg.fields.routingKey == 'upload') {
      this.postService.posting(content);
    }
  }

  publishMsg(key, msgForm) {
    this.channel.publish(this.que, key, Buffer.from(JSON.stringify(msgForm)));
  }
}
