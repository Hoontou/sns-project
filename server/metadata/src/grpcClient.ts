import {
  ServiceError,
  credentials,
  loadPackageDefinition,
} from '@grpc/grpc-js';
import { LoginRequest } from './proto/authPackage/LoginRequest';
import { LoginResult__Output } from './proto/authPackage/LoginResult';
import { ProtoGrpcType } from './proto/auth';
import { loadSync } from '@grpc/proto-loader';

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
