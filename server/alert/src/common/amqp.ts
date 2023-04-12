import { alertRepository } from '../database/alert.repo';
import { AlertDto, Que } from 'sns-interfaces';
import { socketManager } from '../alert.server/socket.manager';
import * as amqp from 'amqplib';

const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

const handleAlert = (message) => {
  const data: AlertDto = JSON.parse(message.content.toString());
  const socket = socketManager.getSocket(data.userId);
  if (socket) {
    socket.emit('tst', data);
    console.log('업로드 소켓전송');
  }
  // console.log(data);
  alertRepository.saveAlert(data); //몽고디비 저장 함수
};

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
      await this.channel.consume(
        que,
        (message) => {
          const messageFrom: Que = message.properties.appId;
          console.log(`${whoAreU} MSA catch message from ${messageFrom}`);

          if (messageFrom === 'upload') {
            handleAlert(message);
          }
        },
        { noAck: true },
      );
    });
    console.log('RabbitMQ connected');
  }

  sendMsg(targetQue: Que, msgForm: object): void {
    this.channel.sendToQueue(
      targetQue,
      Buffer.from(JSON.stringify(msgForm)),
      this.options,
    );
  }
}

export const rabbitMQ = new RabbitMQ(RABBIT);
