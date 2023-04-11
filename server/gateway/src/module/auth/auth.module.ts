import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { ClientsModule } from '@nestjs/microservices';
import { authMicroserviceOptions } from 'src/grpc/connection.options';

@Module({
  imports: [ClientsModule.register([authMicroserviceOptions])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
