import fastify from 'fastify';
import { rabbitMQ } from './common/amqp';
import { metaRepository } from './database/metadata.repo';
import { MetadataRequest } from './common/interface';
import { crypter } from './common/crypter';
import { MetadataDto } from 'sns-interfaces';
import { connectMongo } from './database/initialize.mongo';

const server = fastify();

//from Client
server.post(
  '/getposts',
  async (req: MetadataRequest, reply): Promise<{ posts: MetadataDto[] }> => {
    const decId = crypter.decrypt(req.body.userId);
    const posts: MetadataDto[] = await metaRepository.db.find({
      userId: decId,
    });

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
  rabbitMQ.initialize('metadata');
  console.log(`metadata on 4003:80`);
});
