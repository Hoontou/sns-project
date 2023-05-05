import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { ClientsModule } from '@nestjs/microservices';
import { postMicroserviceOptions } from 'src/grpc/connection.options';

@Module({
  imports: [ClientsModule.register([postMicroserviceOptions])],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
