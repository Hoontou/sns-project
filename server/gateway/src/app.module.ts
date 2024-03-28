import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AlertModule } from './module/alert/alert.module';
import { MetadataModule } from './module/metadata/metadata.module';
import { PostModule } from './module/post/post.module';
import { FflModule } from './module/ffl/ffl.module';
import { PostController } from './module/post/post.controller';
import { AuthModule } from './module/auth/auth.module';
import { AuthMiddleware } from './module/auth/auth.middleware';
import { UserModule } from './module/user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetadataController } from './module/metadata/metadata.controller';
import { FflController } from './module/ffl/ffl.controller';
import { UserController } from './module/user/user.controller';
import { AlertController } from './module/alert/alert.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { typeORMConfig } from './configs/typeorm.config';
import { DirectController } from './module/direct/direct.controller';
import { DirectModule } from './module/direct/direct.module';
import { SearchModule } from './module/search/search.module';
import { UploadModule } from './module/upload/upload.module';

const MONGO_URI = process.env.MONGO_URI;

const mongoUrl = (url: string | undefined) => {
  if (url === undefined) {
    throw new Error('MONGO URL IS MISSING');
  }
  return url;
};

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    MongooseModule.forRoot(mongoUrl(MONGO_URI)),
    PostModule,
    MetadataModule,
    AlertModule,
    FflModule,
    AuthModule,
    UserModule,
    DirectModule,
    SearchModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //https://docs.nestjs.com/middleware 미들웨어 컨슈머 전역으로 설치하는법
    //지금 user컨트롤러에는 제외해놨음
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/(.*)')
      .forRoutes(
        AlertController,
        PostController,
        AppController,
        MetadataController,
        FflController,
        UserController,
        DirectController,
      );
  }
}
