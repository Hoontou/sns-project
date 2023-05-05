import { Transport, ClientProviderOptions } from '@nestjs/microservices';
import { join } from 'path';
export const authMicroserviceOptions: ClientProviderOptions = {
  name: 'auth',
  transport: Transport.GRPC,
  options: {
    url: 'user:80',
    package: 'auth',
    protoPath: join(__dirname, 'proto/auth.proto'),
  },
};
export const userMicroserviceOptions: ClientProviderOptions = {
  name: 'user',
  transport: Transport.GRPC,
  options: {
    url: 'user:81',
    package: 'user',
    protoPath: join(__dirname, 'proto/user.proto'),
  },
};

export const metadataMicroserviceOptions: ClientProviderOptions = {
  name: 'metadata',
  transport: Transport.GRPC,
  options: {
    url: 'metadata:80',
    package: 'metadata',
    protoPath: join(__dirname, 'proto/metadata.proto'),
  },
};

export const fflMicroserviceOptions: ClientProviderOptions = {
  name: 'ffl',
  transport: Transport.GRPC,
  options: {
    url: 'ffl:80',
    package: 'ffl',
    protoPath: join(__dirname, 'proto/ffl.proto'),
  },
};
export const postMicroserviceOptions: ClientProviderOptions = {
  name: 'post',
  transport: Transport.GRPC,
  options: {
    url: 'post:80',
    package: 'post',
    protoPath: join(__dirname, 'proto/post.proto'),
  },
};
