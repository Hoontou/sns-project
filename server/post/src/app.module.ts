import { Module } from '@nestjs/common';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './post/post.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig), PostModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
