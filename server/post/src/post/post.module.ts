import { Module, forwardRef } from '@nestjs/common';
import { PostTable } from './repository/post.repository';
import { CommentTable } from './repository/comment.repository';
import { CoCommentTable } from './repository/cocomment.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Comment } from './entity/comment.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Cocomment } from './entity/cocomment.entity';
import { AmqpModule } from 'src/amqp/amqp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, Cocomment]),
    forwardRef(() => AmqpModule),
  ],
  providers: [PostTable, CommentTable, CoCommentTable, PostService],
  controllers: [PostController],
  exports: [PostService, PostTable, CommentTable, CoCommentTable],
})
export class PostModule {}
