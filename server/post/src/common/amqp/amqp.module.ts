import { Module, forwardRef } from '@nestjs/common';
import { AmqpService } from './amqp.service';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [forwardRef(() => PostModule)],
  controllers: [],
  providers: [AmqpService],
  exports: [AmqpService],
})
export class AmqpModule {}
