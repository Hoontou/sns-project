import fastify from 'fastify';
import { connectMongo } from './database/initialize.mongo';
import { rabbitMQ } from './common/amqp';
import { startGrpcServer } from './grpcServer';
import { Server } from '@grpc/grpc-js';

const server = fastify();
const grpcServer = new Server();

server.get('/ping', (req, reply) => {
  return 'pong';
});

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  connectMongo();
  rabbitMQ.initialize(['sub']);
  console.log(`sub-back on 4001:80`);
  startGrpcServer(grpcServer); //이걸 어디놓아야 좋은지 잘 모르겠음.
});
