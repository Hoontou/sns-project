import { Module } from '@nestjs/common';
import { FflController } from './ffl.controller';
import { FflService } from './ffl.service';
import { AmqpModule } from 'src/module/amqp/amqp.module';
import { ClientsModule } from '@nestjs/microservices';
import { fflMicroserviceOptions } from 'src/grpc/connection.options';

import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ClientsModule.register([fflMicroserviceOptions]),
    AmqpModule,
    UserModule,
  ],
  controllers: [FflController],
  providers: [FflService],
  exports: [FflService],
})
export class FflModule {}
