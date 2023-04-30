import { Module } from '@nestjs/common';
import { FflController } from './ffl.controller';
import { FflService } from './ffl.service';
import { AmqpModule } from 'src/common/amqp/amqp.module';
import { ClientsModule } from '@nestjs/microservices';
import { fflMicroserviceOptions } from 'src/grpc/connection.options';

@Module({
  imports: [ClientsModule.register([fflMicroserviceOptions]), AmqpModule],
  controllers: [FflController],
  providers: [FflService],
  exports: [FflService],
})
export class FflModule {}
