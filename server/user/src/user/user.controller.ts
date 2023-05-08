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
  async getUserinfo(data: { userId: string }) {
    return this.userinfoTable.getUserinfo(data);
  }

  @GrpcMethod('UserService', 'GetUsernameWithImg')
  async getUsernameWithImg(data: {
    userId: string;
  }): Promise<{ username: string; img: string }> {
    return this.userinfoTable.getUsernameWithImg(data);
  }

  @GrpcMethod('UserService', 'GetUsernameWithImgList')
  async getUsernameWithImgList(data: { userIds: string[] }): Promise<{
    userList: { username: string; img: string; userId: number }[];
  }> {
    return this.userinfoTable.getUsernameWithImgList(data);
  }

  @GrpcMethod('UserService', 'ChangeUsername')
  async changeUsername(data: {
    userId: string;
    username: string;
  }): Promise<{ success: boolean; exist?: boolean }> {
    return this.userTable.changeUsername(data);
  }

  @GrpcMethod('UserService', 'ChangeIntro')
  async changeIntro(data: {
    userId: string;
    intro: string;
  }): Promise<{ success: boolean }> {
    return this.userinfoTable.changeIntro(data);
  }
}
