import fastify from 'fastify';
import { rabbitMQ } from './common/amqp';
import { metaRepository } from './database/metadata.repo';
import { MetadataRequest } from './common/interface';
import { crypter } from './common/crypter';
import { MetadataDto } from 'sns-interfaces';
import { connectMongo } from './database/initialize.mongo';
import {
  ServiceError,
  credentials,
  loadPackageDefinition,
} from '@grpc/grpc-js';
import { LoginRequest } from './proto/authPackage/LoginRequest';
import { LoginResult__Output } from './proto/authPackage/LoginResult';
import { ProtoGrpcType } from './proto/auth';
import { loadSync } from '@grpc/proto-loader';

const server = fastify();
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const protoDef = loadSync('./proto/auth.proto', options);
const packageDef: ProtoGrpcType = loadPackageDefinition(protoDef) as any;

const loginRequest: LoginRequest = {
  username: 'admin',
  password: 'qwerty',
};

const client = new packageDef.authPackage.AuthService(
  'sub-back:81',
  credentials.createInsecure(),
);
client.login(
  loginRequest,
  (err: ServiceError | null, res: LoginResult__Output | undefined) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(JSON.stringify(res));
  },
);

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
  rabbitMQ.initialize(['metadata']);
  console.log(`metadata on 4003:80`);
});
