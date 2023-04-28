import { Module } from '@nestjs/common';
import { FflController } from './ffl.controller';
import { FflService } from './ffl.service';
import { AmqpModule } from 'src/common/amqp/amqp.module';

@Module({
  imports: [AmqpModule],
  controllers: [FflController],
  providers: [FflService],
})
export class FflModule {}
