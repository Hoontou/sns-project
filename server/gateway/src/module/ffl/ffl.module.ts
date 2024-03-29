import { forwardRef, Module } from '@nestjs/common';
import { FflController } from './ffl.controller';
import { FflService } from './ffl.service';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowSchema } from './repository/schema/follow.schema';
import { PostLikeSchema } from './repository/schema/postLike.schema';
import { CommentLikeSchema } from './repository/schema/commentLike.schema';
import { CocommentLikeSchema } from './repository/schema/cocommentLike.schema';
import { FollowCollection } from './repository/follow.cellection';
import { PostLikeCollection } from './repository/postLike.collection';
import { PostModule } from '../post/post.module';
import { FflRepository } from './ffl.repository';
import { CommentLikeCollection } from './repository/commentLike.collection';
import { CocommentLikeCollection } from './repository/cocommentLike.collection';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'follow', schema: FollowSchema },
      { name: 'like', schema: PostLikeSchema },
      { name: 'commentlike', schema: CommentLikeSchema },
      { name: 'cocommentlike', schema: CocommentLikeSchema },
    ]),
    forwardRef(() => PostModule),
    UserModule,
    AlertModule,
  ],
  controllers: [FflController],
  providers: [
    FflService,
    FflRepository,
    FollowCollection,
    PostLikeCollection,
    CommentLikeCollection,
    CocommentLikeCollection,
  ],
  exports: [FflService],
})
export class FflModule {}
