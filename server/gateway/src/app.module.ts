import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AmqpModule } from './common/amqp/amqp.module';
import { UserModule } from './module/user/user.module';
import { AlertModule } from './module/alert/alert.module';
import { MetadataModule } from './module/metadata/metadata.module';
import { PostModule } from './module/post/post.module';
import { FflModule } from './module/ffl/ffl.module';
import { PostController } from './module/post/post.controller';
import { AuthMiddleware } from './module/user/auth.middleware';

@Module({
  imports: [
    AmqpModule,
    UserModule,
    MetadataModule,
    AlertModule,
    PostModule,
    FflModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //https://docs.nestjs.com/middleware 미들웨어 컨슈머 전역으로 설치하는법
    //지금 user컨트롤러에는 제외해놨음
    consumer
      .apply(AuthMiddleware)
      .exclude('user/(.*)')
      .forRoutes(PostController);
  }
}