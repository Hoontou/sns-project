import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { MetadataDto } from 'sns-interfaces';
import { MetadataGrpcService } from 'src/grpc/grpc.services';

@Injectable()
export class MetadataService {
  private metadataGrpcService: MetadataGrpcService;
  constructor(@Inject('metadata') private client: ClientGrpc) {}
  onModuleInit() {
    this.metadataGrpcService =
      this.client.getService<MetadataGrpcService>('MetadataService');
  }

  getMetadatas(body: { userId: string; page: number }): Promise<
    MetadataDto &
      {
        createdAt: string;
      }[]
  > {
    return lastValueFrom(this.metadataGrpcService.getMetadatas(body));
  }

  getMetadatasLast3Day(data: { userIds: string[]; page: number }): Promise<{
    metadatas: MetadataDto[];
  }> {
    return lastValueFrom(this.metadataGrpcService.getMetadatasLast3Day(data));
  }
}
