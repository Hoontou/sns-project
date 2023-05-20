import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { ClientsModule } from '@nestjs/microservices';
import { postMicroserviceOptions } from 'src/grpc/connection.options';
import { FflModule } from '../ffl/ffl.module';

@Module({
  imports: [ClientsModule.register([postMicroserviceOptions]), FflModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
