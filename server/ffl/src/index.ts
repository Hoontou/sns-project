import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

import { rabbitMQ } from './common/amqp';
import { connectMongo } from './database/initialize.mongo';
import { crypter } from './common/crypter';
import { ProtoGrpcType } from './proto/ffl';
import { FflServiceHandlers } from './proto/ffl/FflService';
import { followRepository } from './database/follow.repo';
import { likeRopository } from './database/like.repo';

const PORT = 80;
const packageDef = protoLoader.loadSync(join(__dirname, './proto/ffl.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcObj = grpc.loadPackageDefinition(
  packageDef,
) as unknown as ProtoGrpcType;
const fflPackage = grpcObj.ffl;

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
      console.log(`ffl on 4001:${port}`);

      connectMongo();
      rabbitMQ.initialize('ffl');
      server.start();
    },
  );
};
const getServer = () => {
  const server = new grpc.Server();
  server.addService(fflPackage.FflService.service, {
    GetFollowed: async (req, res) => {
      //myId가 userId를 팔로우했는지 가져와야함.
      //userFrom: myId, userTo: userId
      const decUserId = crypter.decrypt(req.request.userId);
      const decMyId = crypter.decrypt(req.request.myId);

      const followed: unknown[] = await followRepository.db.find({
        userTo: decUserId,
        userFrom: decMyId,
      });

      //팔로우 찾은게 없으면 false 있으면 true
      res(null, { followed: followed.length === 0 ? false : true });
    },
    GetLiked: async (req, res) => {
      //userId, postId
      //userId가 postId에 좋아요 눌렀는지 가져와야함.
      const decUserId = crypter.decrypt(req.request.userId);
      const liked: unknown[] = await likeRopository.db.find({
        userId: decUserId,
        postId: req.request.postId,
      });
      res(null, { liked: liked.length === 0 ? false : true });
    },
  } as FflServiceHandlers);
  return server;
};

main();
