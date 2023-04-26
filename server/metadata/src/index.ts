import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './proto/metadata';
import { MetadataServiceHandlers } from './proto/metadataPackage/MetadataService';
import { rabbitMQ } from './common/amqp';
import { connectMongo } from './database/initialize.mongo';
import { crypter } from './common/crypter';

import { metaRepository } from './database/metadata.repo';

import { Post } from './proto/metadataPackage/Post';

const PORT = 80;
const packageDef = protoLoader.loadSync(
  join(__dirname, './proto/metadata.proto'),
);
const grpcObj = grpc.loadPackageDefinition(
  packageDef,
) as unknown as ProtoGrpcType;
const metadataPackage = grpcObj.metadataPackage;

const main = () => {
  const server = getServer();

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`metadata on 4006:${port}`);

      connectMongo();
      rabbitMQ.initialize('metadata');
      server.start();
    },
  );
};
const getServer = () => {
  const server = new grpc.Server();
  server.addService(metadataPackage.MetadataService.service, {
    GetPosts: async (req, res) => {
      const decId = crypter.decrypt(
        req.request.userId ? req.request.userId : '',
      );
      const posts: Post[] = await metaRepository.db.find({
        userId: decId,
      });
      console.log(posts);
      res(null, { posts });
    },
  } as MetadataServiceHandlers);
  return server;
};

main();
//from Client
// server.post(
//   '/getposts',
//   async (req: MetadataRequest, reply): Promise<{ posts: MetadataDto[] }> => {
//     const decId = crypter.decrypt(req.body.userId);
//     const posts: MetadataDto[] = await metaRepository.db.find({
//       userId: req.body.userId,
//     });
//     console.log(posts);

//     return { posts };
//     //나중에 userId 빼고 보내라. 아니면 암호화해서 보내던지.
//   },
// );

// server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
//   if (err) {
//     console.error(err);
//     process.exit(1);
//   }
//   connectMongo();
//   rabbitMQ.initialize('metadata');
//   console.log(`metadata on 4003:80`);
// });
