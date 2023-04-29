import { Module, forwardRef } from '@nestjs/common';
import { AmqpService } from './amqp.service';
import { PostModule } from 'src/post/post.module';
import { PostHandler } from './handler/post.handler';
import { ExchangeHandler } from './handler/exchange.handler';

@Module({
  imports: [forwardRef(() => PostModule)],
  controllers: [],
  providers: [AmqpService, PostHandler, ExchangeHandler],
  exports: [AmqpService],
})
export class AmqpModule {}
