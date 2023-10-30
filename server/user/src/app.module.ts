import { Module } from '@nestjs/common';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AmqpModule } from './amqp/amqp.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DataSource } from 'typeorm';

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
    AmqpModule,
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
