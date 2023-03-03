import fastify from 'fastify';
import { connectMongo } from './database/initialize.mongo';
import { rabbitMQ } from './common/amqp';
import { Metadata, MetadataDto } from './database/schema';
import { metadataRequest } from './common/interface';
import { crypter } from './common/crypter';

const server = fastify();

server.post(
  '/getposts',
  async (req: metadataRequest, reply): Promise<{ posts: MetadataDto[] }> => {
    console.log(req.body);
    const decUuid = crypter.decrypt(req.body.userUuid);
    const posts: MetadataDto[] = await Metadata.find({ userUuid: decUuid });
    return { posts };
    //나중에 useruuid 빼고 보내라. 아니면 암호화해서 보내던지.
  },
);

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  connectMongo();
  rabbitMQ.initialize(['metadata']);

  console.log(`Server listening at ${address}`);
});
