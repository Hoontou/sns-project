import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Usernums } from './entity/usernums.entity';
import { UserTable } from './repository/user.repository';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { UsernumsTable } from './repository/usernums.repository';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Usernums]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserTable, UsernumsTable, UserService, JwtService],
  exports: [UserTable, UsernumsTable],
})
export class UserModule {}
