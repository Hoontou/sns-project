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
