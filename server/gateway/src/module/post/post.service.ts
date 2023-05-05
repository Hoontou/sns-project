import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PostGrpcService } from 'src/grpc/grpc.services';

@Injectable()
export class PostService {
  private postGrpcService: PostGrpcService;
  constructor(@Inject('post') private client: ClientGrpc) {}
  onModuleInit() {
    this.postGrpcService =
      this.client.getService<PostGrpcService>('PostService');
  }
  async getPostnums(
    postId: string,
  ): Promise<{ likesCount: number; commentCount: number }> {
    return lastValueFrom(this.postGrpcService.getPostnums({ postId }));
  }
}
