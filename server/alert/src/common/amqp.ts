import { alertRepository } from '../database/schema';
import { AlertDto } from 'sns-interfaces';
import { socketManager } from '../alert.server/socket.manager';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const amqp = require('amqplib');
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
  console.log('alert MSA catch alertForm from upload');
  // console.log(data);
  alertRepository.saveAlert(data); //몽고디비 저장 함수
};

class RabbitMQ {
  private conn;
  private channel;
  constructor(private rabbitUrl) {}

  async initialize(queList: string[]) {
    this.conn = await amqp.connect(this.rabbitUrl);
    this.channel = await this.conn.createChannel();
    queList.forEach(async (que) => {
      await this.channel.assertQueue(que, { durable: true });
      await this.channel.consume(
        que,
        (message) => {
          const targetQue: string = message.fields.routingKey;
          if (targetQue === 'alert') {
            handleAlert(message);
          }
        },
        { noAck: true },
      );
    });
    console.log('RabbitMQ connected');
  }

  sendMsg(targetQue: string, msgForm: object): void {
    this.channel.sendToQueue(targetQue, Buffer.from(JSON.stringify(msgForm)));
  }
}

export const rabbitMQ = new RabbitMQ(RABBIT);
