import { Module, forwardRef } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { ClientsModule } from '@nestjs/microservices';
import { postMicroserviceOptions } from 'src/grpc/connection.options';
import { FflModule } from '../ffl/ffl.module';
import { AmqpModule } from 'src/module/amqp/amqp.module';
import { MetadataModule } from '../metadata/metadata.module';
import { AppModule } from '../../app.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Cocomment } from './entity/cocomment.entity';
import { Comment } from './entity/comment.entity';
import { PostRepository } from './post.repository';
import { CoCommentTable } from './repository/cocomment.table';
import { CommentTable } from './repository/comment.table';
import { PostTable } from './repository/post.table';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, Cocomment]),
    FflModule,
    AmqpModule,
    forwardRef(() => MetadataModule),
    forwardRef(() => AppModule),
    UserModule,
  ],
  controllers: [PostController],
  providers: [
    PostService,
    PostRepository,
    PostTable,
    CommentTable,
    CoCommentTable,
    SearchService,
  ],
  exports: [PostService],
})
export class PostModule {}
