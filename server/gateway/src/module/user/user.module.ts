import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ClientsModule } from '@nestjs/microservices';
import { userMicroserviceOptions } from 'src/grpc/connection.options';

@Module({
  imports: [ClientsModule.register([userMicroserviceOptions])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
