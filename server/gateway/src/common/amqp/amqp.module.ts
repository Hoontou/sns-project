import { Module } from '@nestjs/common';
import { AmqpService } from './amqp.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AmqpService],
  exports: [AmqpService],
})
export class AmqpModule {}
