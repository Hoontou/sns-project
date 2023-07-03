import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
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
  async getUserinfo(userId: string): Promise<
    | {
        success: true;
        following: number;
        follower: number;
        postcount: number;
        img: string;
        introduce: string;
        username: string;
      }
    | { success: false }
  > {
    //userId는 userinfo를 찾아서 올 아이디.
    //myId는 다른유저의 피드로 접근했을 시 다른유저를 팔로우했는지 찾을 용도.
    try {
      const result = await lastValueFrom(
        this.userGrpcService.getUserinfo({
          userId: crypter.decrypt(userId),
        }),
      );
      console.log(result);
      return {
        ...result,
        success: true,
      };
    } catch (err) {
      return { success: false };
    }
  }

  async getUsernameWithImg(
    userId: string,
  ): Promise<{ username: string; img: string; userId: number }> {
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
}
