import { Module } from '@nestjs/common';
import { AmqpModule } from './common/amqp/amqp.module';
import { UserModule } from './module/user/user.module';
import { AlertModule } from './module/alert/alert.module';
import { MetadataModule } from './module/metadata/metadata.module';
import { PostModule } from './module/post/post.module';
import { FflModule } from './module/ffl/ffl.module';

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
export class AppModule {}
