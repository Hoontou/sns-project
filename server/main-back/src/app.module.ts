import { Module } from '@nestjs/common';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig), AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
