import { Module } from '@nestjs/common';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './post/post.module';
import { AmqpModule } from './amqp/amqp.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig), PostModule, AmqpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
