import fastify from 'fastify';
import { connectMongo } from './database/initialize.mongo';
import { rabbitMQ } from './common/amqp';
import { Metadata, MetadataDto } from './database/schema';
import { MetadataRequest } from './common/interface';
import { crypter } from './common/crypter';

const server = fastify();

//from Client
server.post(
  '/getposts',
  async (req: MetadataRequest, reply): Promise<{ posts: MetadataDto[] }> => {
    console.log('hi');
    const decId = crypter.decrypt(req.body.userId);
    console.log(decId);
    const posts: MetadataDto[] = await Metadata.find({ userId: decId });
    console.log(posts);

    return { posts };
    //나중에 userId 빼고 보내라. 아니면 암호화해서 보내던지.
  },
);

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  connectMongo();
  rabbitMQ.initialize(['metadata']);

  console.log(`metadata on 4003:80`);
});
