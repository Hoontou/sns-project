//https://blog.insane.pe.kr/m/1533
//https://medium.com/@yujso66/%EB%B2%88%EC%97%AD-node-js%EC%97%90%EC%84%9C-grpc-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-4521604d8852
//https://www.npmjs.com/package/@grpc/proto-loader
//위 세개 참고했음.

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './proto/auth';
import { AuthServiceHandlers } from './proto/authPackage/AuthService';
import {
  ServerCredentials,
  ServerUnaryCall,
  sendUnaryData,
} from '@grpc/grpc-js';
import { LoginCode } from './proto/authPackage/LoginCode';
import { LoginRequest } from './proto/authPackage/LoginRequest';
import { LoginResult } from './proto/authPackage/LoginResult';

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const users = [{ id: 0, username: 'admin', password: 'qwerty' }];
export const login = (
  call: ServerUnaryCall<LoginRequest, LoginResult>,
  callback: sendUnaryData<LoginResult>,
) => {
  const user = users.find(
    (user) =>
      user.username === call.request.username &&
      user.password === call.request.password,
  );

  if (user) {
    const result: LoginResult = {
      loginCode: LoginCode.SUCCESS,
      token: 'RandomSecretToken',
    };
    callback(null, result);
  } else {
    const result: LoginResult = {
      loginCode: LoginCode.FAIL,
    };
    callback(null, result);
  }
};
const loginServer: AuthServiceHandlers = {
  // server handlers implementation...
  login,
};

const packageDefinition = protoLoader.loadSync('./proto/auth.proto', options);
export const proto = grpc.loadPackageDefinition(
  packageDefinition,
) as unknown as ProtoGrpcType;

export const startGrpcServer = (server) => {
  server.addService(proto.authPackage.AuthService.service, loginServer); // login 은 이후에 정의할 예정입니다.
  server.bindAsync('localhost:81', ServerCredentials.createInsecure(), () => {
    server.start();
  });
};
//근데 이거를 이렇게 해도 되나??
