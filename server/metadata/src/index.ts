import fastify from 'fastify';
import { connectMongo } from './database/initialize.mongo';
import { rabbitMQ } from './common/amqp';
import { Metadata } from './database/schema';
import { metadataRequest } from './common/interface';
import { crypter } from './common/crypter';
const server = fastify();

server.post('/getposts', async (req: metadataRequest, reply) => {
  console.log(req.body);
  const decUuid = crypter.decrypt(req.body.userUuid);
  const posts = await Metadata.find({ userUuid: decUuid });
  console.log(posts);
  return 'hi';
});

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  connectMongo();
  rabbitMQ.initialize(['metadata']);

  console.log(`Server listening at ${address}`);
});
