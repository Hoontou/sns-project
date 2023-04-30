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
  async getUsernums(body: { userId: string; myId?: string }): Promise<
    | {
        success: true;
        following: number;
        follower: number;
        postcount: number;
        username: string;
      }
    | { success: false }
  > {
    //userId는 usernums를 찾아서 올 아이디.
    //myId는 다른유저의 피드로 접근했을 시 다른유저를 팔로우했는지 찾을 용도.
    try {
      const result = await lastValueFrom(
        this.userGrpcService.getUsernums({
          userId: crypter.decrypt(body.userId),
        }),
      );
      return {
        ...result,
        success: true,
      };
    } catch (err) {
      return { success: false };
    }
  }
}
