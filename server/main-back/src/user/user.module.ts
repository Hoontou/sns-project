import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserNums } from './entity/usernums.entity';
import { UserTable } from './repository/user.repository';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { UserNumsTable } from './repository/usernums.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserNums]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserTable, UserNumsTable, UserService],
  exports: [UserTable],
})
export class UserModule {}
