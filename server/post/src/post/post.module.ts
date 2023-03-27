import { Module } from '@nestjs/common';
import { PostTable } from './repository/post.repository';
import { CommentTable } from './repository/comment.repository';
import { CoCommentTable } from './repository/cocomment.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Comment } from './entity/comment.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Cocomment } from './entity/cocomment.entity';
import { Commentnums, Cocommentnums } from './entity/count.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Comment,
      Cocomment,
      Commentnums,
      Cocommentnums,
    ]),
  ],
  providers: [PostTable, CommentTable, CoCommentTable, PostService],
  controllers: [PostController],
})
export class PostModule {}