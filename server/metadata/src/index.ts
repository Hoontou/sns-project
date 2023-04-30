import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './proto/metadata';
import { MetadataServiceHandlers } from './proto/metadata/MetadataService';
import { rabbitMQ } from './common/amqp';
import { connectMongo } from './database/initialize.mongo';
import { crypter } from './common/crypter';
import { metaRepository } from './database/metadata.repo';
import { Metadata } from './proto/metadata/Metadata';

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
      const metadatas: Metadata[] = await metaRepository.db.find({
        userId: req.request.userId ? req.request.userId : '',
      });
      res(null, { metadatas });
    },
  } as MetadataServiceHandlers);
  return server;
};

main();
