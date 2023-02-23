import fastify from 'fastify';
import { connectMongo } from './database/initialize.mongo';

const server = fastify();
connectMongo();

server.post('/tstinput', (req, reply) => {
  console.log(req.body);
});

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
