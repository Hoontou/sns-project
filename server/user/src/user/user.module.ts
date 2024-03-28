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
import { UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserCollection } from './repository/user.collection';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Userinfo, Usernums]),
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
    //몽고디비 컬렉션에는 'users' 으로 잡힌다.
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    UserRepository,
    UserTable,
    UserinfoTable,
    UsernumsTable,
    UserCollection,
    UserService,
    JwtService,
  ],
  exports: [UserRepository, UserCollection],
})
export class UserModule {}
