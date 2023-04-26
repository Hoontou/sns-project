import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { crypter } from 'src/common/crypter';
import { UserGrpcService } from 'src/grpc/grpc.interfaces';

@Injectable()
export class UserService {
  private userGrpcService: UserGrpcService;
  constructor(@Inject('user') private client: ClientGrpc) {}
  onModuleInit() {
    this.userGrpcService =
      this.client.getService<UserGrpcService>('UserService');
  }
  async getUsernums(userId: string): Promise<{
    following: number;
    follower: number;
    postcount: number;
  }> {
    return lastValueFrom(
      this.userGrpcService.getUsernums({
        userId: crypter.decrypt(userId),
      }),
    );
  }
}
