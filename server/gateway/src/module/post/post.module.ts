import { Module, forwardRef } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { FflModule } from '../ffl/ffl.module';
import { AmqpModule } from 'src/module/amqp/amqp.module';
import { MetadataModule } from '../metadata/metadata.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Cocomment } from './entity/cocomment.entity';
import { Comment } from './entity/comment.entity';
import { PostRepository } from './post.repository';
import { CoCommentTable } from './repository/cocomment.table';
import { CommentTable } from './repository/comment.table';
import { PostTable } from './repository/post.table';
import { AlertModule } from '../alert/alert.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, Cocomment]),
    forwardRef(() => FflModule),
    AmqpModule,
    forwardRef(() => MetadataModule),
    UserModule,
    AlertModule,
    SearchModule,
  ],
  controllers: [PostController],
  providers: [
    PostService,
    PostRepository,
    PostTable,
    CommentTable,
    CoCommentTable,
  ],
  exports: [PostService],
})
export class PostModule {}
