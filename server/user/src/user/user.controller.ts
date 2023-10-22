import { Controller, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcMethod } from '@nestjs/microservices';
import { UserinfoWithNums } from 'sns-interfaces/grpc.interfaces';
import { elastic } from 'src/configs/elasticsearch';

const UserGrpc = 'UserService';

@Controller('user')
export class UserController {
  private logger = new Logger('UserController');
  constructor(private userService: UserService) {}

  @GrpcMethod(UserGrpc, 'GetUserinfoById')
  async getUserinfoById(data: { userId: string }): Promise<UserinfoWithNums> {
    return this.userService.getUserinfo({ type: 'byId', userId: data.userId });
  }

  @GrpcMethod(UserGrpc, 'GetUserinfoByUsername')
  async getUserinfoByUsername(data: {
    username: string;
  }): Promise<UserinfoWithNums> {
    return this.userService.getUserinfo({
      type: 'byUsername',
      username: data.username,
    });
  }

  @GrpcMethod(UserGrpc, 'GetUsernameWithImg')
  async getUsernameWithImg(data: {
    userId: string;
  }): Promise<{ username: string; img: string; introduceName: string }> {
    return this.userService.getUsernameWithImg(data);
  }

  @GrpcMethod(UserGrpc, 'GetUsernameWithImgList')
  async getUsernameWithImgList(data: { userIds: string[] }): Promise<{
    userList: {
      username: string;
      img: string;
      userId: number;
      introduceName: string;
    }[];
  }> {
    return this.userService.getUsernameWithImgList(data);
  }

  @GrpcMethod(UserGrpc, 'ChangeUsername')
  async changeUsername(data: {
    userId: string;
    username: string;
  }): Promise<{ success: boolean; exist?: boolean }> {
    return this.userService.changeUsername(data);
  }

  @GrpcMethod(UserGrpc, 'ChangeIntro')
  async changeIntro(data: {
    userId: string;
    intro: string;
  }): Promise<{ success: boolean }> {
    return this.userService.changeIntro(data);
  }

  @GrpcMethod(UserGrpc, 'ChangeIntroduceName')
  async changeIntroduceName(data: {
    userId: string;
    introduceName: string;
  }): Promise<{ success: boolean }> {
    return this.userService.changeIntroduceName(data);
  }

  @GrpcMethod(UserGrpc, 'SearchUsersBySearchString')
  searchUsersBySearchString(data: { searchString: string; page: number }) {
    return elastic.searchUsersBySearchString(data);
  }
}
