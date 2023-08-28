import { Controller, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcMethod } from '@nestjs/microservices';
import { UserinfoWithNums } from 'sns-interfaces/grpc.interfaces';

@Controller('user')
export class UserController {
  private logger = new Logger('UserController');
  constructor(private userService: UserService) {}

  @GrpcMethod('UserService', 'GetUserinfoById')
  async getUserinfoById(data: { userId: string }): Promise<UserinfoWithNums> {
    return this.userService.getUserinfo({ type: 'byId', userId: data.userId });
  }

  @GrpcMethod('UserService', 'GetUserinfoByUsername')
  async getUserinfoByUsername(data: {
    username: string;
  }): Promise<UserinfoWithNums> {
    return this.userService.getUserinfo({
      type: 'byUsername',
      username: data.username,
    });
  }

  @GrpcMethod('UserService', 'GetUsernameWithImg')
  async getUsernameWithImg(data: {
    userId: string;
  }): Promise<{ username: string; img: string }> {
    return this.userService.getUsernameWithImg(data);
  }

  @GrpcMethod('UserService', 'GetUsernameWithImgList')
  async getUsernameWithImgList(data: { userIds: string[] }): Promise<{
    userList: { username: string; img: string; userId: number }[];
  }> {
    return this.userService.getUsernameWithImgList(data);
  }

  @GrpcMethod('UserService', 'ChangeUsername')
  async changeUsername(data: {
    userId: string;
    username: string;
  }): Promise<{ success: boolean; exist?: boolean }> {
    return this.userService.changeUsername(data);
  }

  @GrpcMethod('UserService', 'ChangeIntro')
  async changeIntro(data: {
    userId: string;
    intro: string;
  }): Promise<{ success: boolean }> {
    return this.userService.changeIntro(data);
  }
}
