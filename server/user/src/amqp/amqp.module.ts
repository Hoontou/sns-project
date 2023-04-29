import { Module } from '@nestjs/common';
import { AmqpService } from './amqp.service';
import { UserModule } from 'src/user/user.module';
import { ExchangeHandler } from './handler/exchange.handler';
import { UserHandler } from './handler/user.handler';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [AmqpService, UserHandler, ExchangeHandler],
  exports: [AmqpService],
})
export class AmqpModule {}
