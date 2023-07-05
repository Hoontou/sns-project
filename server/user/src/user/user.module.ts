import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Userinfo } from './entity/userinfo.entity';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserTable } from './repository/user.table';
import { UserinfoTable } from './repository/userinfo.table';
import { UsernumsTable } from './repository/usernums.table';
import { UserRepository } from './user.repo';
import { Usernums } from './entity/usernums.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Userinfo, Usernums]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    UserRepository,
    UserTable,
    UserinfoTable,
    UsernumsTable,
    UserService,
    JwtService,
  ],
  exports: [UserRepository],
})
export class UserModule {}
