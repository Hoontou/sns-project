import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { MetadataDto } from 'sns-interfaces';
import { AppService } from 'src/app.service';
import { crypter } from 'src/common/crypter';
import { MetadataGrpcService } from 'src/grpc/grpc.services';

@Injectable()
export class MetadataService {
  private metadataGrpcService: MetadataGrpcService;
  constructor(
    @Inject('metadata') private client: ClientGrpc,
    @Inject(forwardRef(() => AppService))
    private appService: AppService,
  ) {}
  onModuleInit() {
    this.metadataGrpcService =
      this.client.getService<MetadataGrpcService>('MetadataService');
  }

  async getMetadatas(body: { userId: string; page: number }): Promise<{
    metadatas: (MetadataDto & { createdAt: string })[];
  }> {
    const { metadatas } = await lastValueFrom(
      this.metadataGrpcService.getMetadatas(body),
    );
    if (metadatas === undefined) {
      return { metadatas: [] };
    }
    return { metadatas };
  }

  async getMetadatasLast3Day(data: {
    userIds: string[];
    page: number;
  }): Promise<{
    metadatas: MetadataDto[];
  }> {
    const { metadatas } = await lastValueFrom(
      this.metadataGrpcService.getMetadatasLast3Day(data),
    );
    if (metadatas === undefined) {
      return { metadatas: [] };
    }
    return { metadatas };
  }

  async getMetadatasByPostId(data: { _ids: string[] }) {
    return await lastValueFrom(
      this.metadataGrpcService.getMetadatasByPostId(data),
    );
  }

  async getMetadataWithPostFooter(data: { postId: string; userId: string }) {
    const result = await lastValueFrom(
      this.metadataGrpcService.getMetadatasByPostId({ _ids: [data.postId] }),
    );

    if (result.metadatas === undefined) {
      return { meatadata: undefined };
    }

    const metadata = result.metadatas[0];

    const postFooter = await this.appService.postFooter({
      userId: data.userId,
      postId: data.postId,
      targetId: crypter.decrypt(metadata.userId),
    });

    return { metadata, userId: data.userId, postFooter };
  }
}
