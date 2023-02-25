// eslint-disable-next-line @typescript-eslint/no-var-requires
const amqp = require('amqplib');
const RABBIT = process.env.RABBIT;
if (!RABBIT) {
  throw new Error('missing RABBIT');
}

export const createMQProducer = (queueName: string) => {
  console.log('Connecting to RabbitMQ...');
  let ch: any;
  amqp.connect(RABBIT, (errorConnect: Error, connection) => {
    if (errorConnect) {
      console.log('Error connecting to RabbitMQ: ', errorConnect);
      return;
    }

    connection.createChannel(async (errorChannel, channel) => {
      if (errorChannel) {
        console.log('Error creating channel: ', errorChannel);
        return;
      }

      ch = channel;
      await channel.assertQueue(queueName, { durable: true });
      console.log('Connected to RabbitMQ');
    });
  });
  return (msg: string) => {
    console.log('Produce message to RabbitMQ...');
    ch.sendToQueue(queueName, Buffer.from(msg));
  };
};

const initializeRabbit = async (queList: string[]) => {
  const conn = await amqp.connect(RABBIT);
  const channel = await conn.createChannel();
  queList.forEach(async (que) => {
    await channel.assertQueue(que, { durable: true });
  });
  console.log('RabbitMQ connected');
  return channel;
};

export const rabbit = initializeRabbit(['metadata', 'alert']);
