import { Controller, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcMethod } from '@nestjs/microservices';
import { UserTable } from './repository/user.repository';
import { UserinfoTable } from './repository/userinfo.repository';

@Controller('user')
export class UserController {
  private logger = new Logger('UserController');
  constructor(
    private userService: UserService,
    private userTable: UserTable,
    private userinfoTable: UserinfoTable,
  ) {}

  @GrpcMethod('UserService', 'GetUserinfo')
  getUserinfo(data: { userId: string }) {
    return this.userinfoTable.getUserinfo(data);
  }

  @GrpcMethod('UserService', 'GetUsername')
  getUsername(data: { userId: string }): Promise<{ username: string }> {
    return this.userTable.getUsername(data);
  }
}
