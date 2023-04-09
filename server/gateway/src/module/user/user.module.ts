import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { userMicroserviceOptions } from 'src/grpc/grpc.options';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [ClientsModule.register([userMicroserviceOptions])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
