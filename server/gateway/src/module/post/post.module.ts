import { Module, forwardRef } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { FflModule } from '../ffl/ffl.module';
import { MetadataModule } from '../metadata/metadata.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './repository/entity/post.entity';
import { Cocomment } from './repository/entity/cocomment.entity';
import { Comment } from './repository/entity/comment.entity';

import { AlertModule } from '../alert/alert.module';
import { SearchModule } from '../search/search.module';
import { PostManager } from './manager/post.manager';
import { CommentManager } from './manager/comment.manager';
import { CocommentManager } from './manager/cocomment.manager';
import { CommentRepository } from './repository/comment.repository';
import { CocommentRepository } from './repository/cocomment.repository';
import { PostRepository } from './repository/post.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, Cocomment]),
    AlertModule,
    SearchModule,
    FflModule,
    forwardRef(() => MetadataModule),
    UserModule,
  ],
  controllers: [PostController],
  providers: [
    PostService,
    PostManager,
    CommentManager,
    CocommentManager,
    PostRepository,
    CommentRepository,
    CocommentRepository,
  ],
  exports: [PostService],
})
export class PostModule {}
