import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { ClientsModule } from '@nestjs/microservices';
import { postMicroserviceOptions } from 'src/grpc/connection.options';
import { FflModule } from '../ffl/ffl.module';
import { AmqpModule } from 'src/module/amqp/amqp.module';

@Module({
  imports: [
    ClientsModule.register([postMicroserviceOptions]),
    FflModule,
    AmqpModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
