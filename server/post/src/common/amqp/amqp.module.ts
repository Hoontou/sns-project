import { Module } from '@nestjs/common';
import { AmqpService } from './amqp.service';

const amqpProvider = { provide: AmqpService, useValue: new AmqpService([]) };

@Module({
  imports: [],
  controllers: [],
  providers: [amqpProvider],
  exports: [amqpProvider],
})
export class AmqpModule {}
