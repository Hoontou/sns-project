import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './proto/metadata';
import { MetadataServiceHandlers } from './proto/metadata/MetadataService';
import { rabbitMQ } from './common/amqp';
import { connectMongo } from './database/initialize.mongo';
import { crypter } from './common/crypter';
import { metaRepository } from './database/metadata.repo';
import { MetadataDto } from 'sns-interfaces';

const PORT = 80;
const packageDef = protoLoader.loadSync(
  join(__dirname, './proto/metadata.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  },
);
const grpcObj = grpc.loadPackageDefinition(
  packageDef,
) as unknown as ProtoGrpcType;
const metadataPackage = grpcObj.metadata;

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
    GetMetadatas: async (req, res) => {
      console.log(req.request.page);
      const len = 9; //가져올 갯수
      const metadatas: MetadataDto[] = await metaRepository.db
        .find({
          userId: req.request.userId ? crypter.decrypt(req.request.userId) : '',
        })
        .sort({ _id: -1 })
        .limit(len)
        .skip(req.request.page * len);

      res(null, {
        metadatas: metadatas.map((item) => {
          item.userId = crypter.encrypt(item.userId);
          return item;
        }),
      });
    },
  } as MetadataServiceHandlers);
  return server;
};

main();
