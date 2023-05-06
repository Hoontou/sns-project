import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Userinfo } from './entity/userinfo.entity';
import { UserTable } from './repository/user.repository';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { UserinfoTable } from './repository/userinfo.repository';
import { JwtService } from '@nestjs/jwt';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Userinfo]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserTable, UserinfoTable, UserService, JwtService],
  exports: [UserTable, UserinfoTable, UserService],
})
export class UserModule {}
