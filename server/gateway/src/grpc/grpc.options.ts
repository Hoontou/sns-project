import { Transport, ClientProviderOptions } from '@nestjs/microservices';
import { join } from 'path';
export const userMicroserviceOptions: ClientProviderOptions = {
  name: 'user',
  transport: Transport.GRPC,
  options: {
    url: 'user:80',
    package: 'user',
    protoPath: join(__dirname, 'proto/user.proto'),
  },
};
