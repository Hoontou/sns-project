import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Comment } from './entity/comment.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Cocomment } from './entity/cocomment.entity';
import { AmqpModule } from 'src/amqp/amqp.module';
import { PostRepository } from './post.repo';
import { CoCommentTable } from './repository/cocomment.table';
import { CommentTable } from './repository/comment.table';
import { PostTable } from './repository/post.table';
import { HashtagService } from './hashtag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, Cocomment]),
    forwardRef(() => AmqpModule),
  ],
  providers: [
    PostRepository,
    PostTable,
    CommentTable,
    CoCommentTable,
    PostService,
    HashtagService,
  ],
  controllers: [PostController],
  exports: [
    PostRepository,
    PostService,
    PostTable,
    CommentTable,
    CoCommentTable,
  ],
})
export class PostModule {}
