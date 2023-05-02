import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AmqpService } from 'src/common/amqp/amqp.service';
import { FflGrpcService } from 'src/grpc/grpc.services';

@Injectable()
export class FflService {
  private logger = new Logger(FflService.name);
  private fflGrpcService: FflGrpcService;
  constructor(
    @Inject('ffl') private client: ClientGrpc,
    private amqpService: AmqpService,
  ) {}
  onModuleInit() {
    this.fflGrpcService = this.client.getService<FflGrpcService>('FflService');
  }

  async addFollow(body: { userTo: string; userFrom: string }) {
    this.amqpService.sendMsg('ffl', body, this.addFollow.name);
    this.amqpService.sendMsg('user', body, this.addFollow.name);
  }

  async removeFollow(body: { userTo: string; userFrom: string }) {
    this.amqpService.sendMsg('ffl', body, this.removeFollow.name);
    this.amqpService.sendMsg('user', body, this.removeFollow.name);
  }

  async checkFollowed(body: {
    userId: string;
    myId: string;
  }): Promise<{ followed: boolean }> {
    return lastValueFrom(this.fflGrpcService.getFollowed(body));
  }

  async checkLiked(body: {
    userId: string;
    postId: string;
  }): Promise<{ liked: boolean }> {
    return lastValueFrom(this.fflGrpcService.checkLiked(body));
  }
}
