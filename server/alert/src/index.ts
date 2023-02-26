import fastify from 'fastify';
import { connectMongo } from './database/initialize.mongo';
// import { rabbit } from './common/amqp';
import { rabbitMQ } from './common/amqp';
const server = fastify();

server.post('/tstinput', (req, reply) => {
  console.log(req.body);
});

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  connectMongo();
  rabbitMQ.initialize(['alert']);

  console.log(`Server listening at ${address}`);
});
