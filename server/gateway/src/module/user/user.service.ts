import { Inject, Injectable, Body } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { SearchedUser } from 'sns-interfaces/grpc.interfaces';
import { UserInfoBody } from 'src/app.service';
import { crypter } from 'src/common/crypter';
import { UserGrpcService } from 'src/grpc/grpc.services';

@Injectable()
export class UserService {
  private userGrpcService: UserGrpcService;
  constructor(@Inject('user') private client: ClientGrpc) {}
  onModuleInit() {
    this.userGrpcService =
      this.client.getService<UserGrpcService>('UserService');
  }

  async getUserinfo(body: UserInfoBody): Promise<
    | {
        userId: string;
        success: true;
        following: number;
        follower: number;
        postcount: number;
        img: string;
        introduce: string;
        username: string;
        introduceName: string;
      }
    | { success: false }
  > {
    //userId는 userinfo를 찾아서 올 아이디.
    //myId는 다른유저의 피드로 접근했을 시 다른유저를 팔로우했는지 찾을 용도.
    try {
      const result = await lastValueFrom(
        body.type === 'myInfo'
          ? this.userGrpcService.getUserinfoById({
              userId: crypter.decrypt(body.userId),
            })
          : this.userGrpcService.getUserinfoByUsername({
              username: body.targetUsername,
            }),
      );
      console.log(result);
      return {
        ...result,
        success: true,
      };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  async getUsernameWithImg(userId: string): Promise<{
    username: string;
    img: string;
    userId: number;
    introduceName: string;
  }> {
    return {
      ...(await lastValueFrom(
        this.userGrpcService.getUsernameWithImg({
          userId,
        }),
      )),
      userId: Number(userId),
    };
  }

  getUsernameWithImgList(userIds: string[]): Promise<{
    userList: { username: string; img: string; userId: number }[];
  }> {
    return lastValueFrom(
      this.userGrpcService.getUsernameWithImgList({
        userIds,
      }),
    );
  }

  changeUsername(body: {
    userId: string;
    username: string;
  }): Promise<{ success: boolean; exist?: boolean }> {
    return lastValueFrom(this.userGrpcService.changeUsername(body));
  }
  /**자기소개 바꾸기 */
  changeIntro(body: { userId: string; intro: string }) {
    return lastValueFrom(this.userGrpcService.changeIntro(body));
  }

  changeIntroduceName(body: {
    introduceName: string;
    userId: string;
  }): Promise<{ success: boolean }> {
    return lastValueFrom(this.userGrpcService.changeIntroduceName(body));
  }

  async searchUsersBySearchString(body: {
    searchString: string;
    page: number;
  }): Promise<{ userList: SearchedUser[] }> {
    const { userList } = await lastValueFrom(
      this.userGrpcService.searchUsersBySearchString(body),
    );

    if (userList === undefined) {
      return { userList: [] };
    }
    return { userList };
  }

  //api재사용한다. 나중에 새로 만들어서 쓰는게 좋을듯
  //필요없는 정보도 같이가져옴
  async getFollowCount(body: { username: string }) {
    const result = await lastValueFrom(
      this.userGrpcService.getUserinfoByUsername({
        username: body.username,
      }),
    );

    return {
      userId: result.userId,
      follower: result.follower,
      following: result.following,
    };
  }
}
