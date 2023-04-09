import { Module } from '@nestjs/common';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AmqpModule } from './common/amqp/amqp.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    AmqpModule,
    AuthModule,
    UserModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
