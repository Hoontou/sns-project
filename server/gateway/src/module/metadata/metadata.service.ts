import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { MetadataGrpcService } from 'src/grpc/grpc.services';

@Injectable()
export class MetadataService {
  private metadataGrpcService: MetadataGrpcService;
  constructor(@Inject('metadata') private client: ClientGrpc) {}
  onModuleInit() {
    this.metadataGrpcService =
      this.client.getService<MetadataGrpcService>('MetadataService');
  }
  async getMetadatas(body: { userId: string; page: number }) {
    const metadatas = await lastValueFrom(
      this.metadataGrpcService.getMetadatas(body),
    );
    return metadatas;
  }
}
