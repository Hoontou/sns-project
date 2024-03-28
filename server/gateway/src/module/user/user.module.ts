import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserCollection } from './repository/user.collection';
import { UserTable } from './repository/user.table';
import { UserinfoTable } from './repository/userinfo.table';
import { UsernumsTable } from './repository/usernums.table';
import { UserRepository } from './user.repo';
import { UserSchema } from './schema/user.schema';
import { AuthModule } from '../auth/auth.module';
import { Userinfo } from './entity/userinfo.entity';
import { Usernums } from './entity/usernums.entity';
import { User } from './entity/user.entity';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Userinfo, Usernums]),
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
    forwardRef(() => AuthModule),
    SearchModule,
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
  exports: [UserRepository, UserService, UserCollection],
})
export class UserModule {}
