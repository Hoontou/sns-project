import { Module } from '@nestjs/common';
import { AmqpService } from './amqp.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [AmqpService],
  exports: [AmqpService],
})
export class AmqpModule {}
