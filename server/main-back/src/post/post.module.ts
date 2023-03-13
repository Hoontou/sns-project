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
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
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
    UserModule,
    AuthModule,
  ],
  providers: [PostTable, CommentTable, CoCommentTable, PostService],
  controllers: [PostController],
})
export class PostModule {}
