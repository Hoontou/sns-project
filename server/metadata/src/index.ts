import fastify from 'fastify';
import { connectMongo } from './database/initialize.mongo';
import { rabbit } from './common/amqp';

const server = fastify();
connectMongo();

server.post('/tstinput', (req, reply) => {
  console.log(req.body);
});

server.listen({ host: '0.0.0.0', port: 80 }, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  await rabbit; //래빗초기화
  console.log(`Server listening at ${address}`);
});