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

  @GrpcMethod('UserService', 'GetUsernameWithImg')
  GetUsernameWithImg(data: {
    userId: string;
  }): Promise<{ username: string; img: string }> {
    return this.userinfoTable.GetUsernameWithImg(data);
  }

  @GrpcMethod('UserService', 'GetUsernameWithImgList')
  GetUsernameWithImgList(data: { userIds: string[] }): Promise<{
    userList: { username: string; img: string; userId: number }[];
  }> {
    return this.userinfoTable.GetUsernameWithImgList(data);
  }
}
