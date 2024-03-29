import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { crypter } from 'src/common/crypter';
import {
  MetadataCollection,
  MetadataDto,
} from './repository/metadata.collection';
import { UploadMessage } from 'sns-interfaces';

@Injectable()
export class MetadataService {
  constructor(
    @Inject(forwardRef(() => AppService))
    private appService: AppService,
    private metadataCollection: MetadataCollection,
  ) {}

  async getMetadatas(body: { userId: string; page: number }): Promise<{
    metadatas: (MetadataDto & { createdAt: string })[];
  }> {
    const { metadatas } = await this.metadataCollection.getMetadatas(body);
    if (metadatas.length === 0) {
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
    const { metadatas } =
      await this.metadataCollection.getMetadatasLast3Day(data);

    if (metadatas.length === 0) {
      return { metadatas: [] };
    }
    return { metadatas };
  }

  getMetadatasByPostId(data: { _ids: string[] }) {
    return this.metadataCollection.getMetadatasByPostId(data._ids);
  }

  async getMetadataWithPostFooter(data: { postId: string; userId: string }) {
    const result = await this.metadataCollection.getMetadatasByPostId([
      data.postId,
    ]);

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

  deleteMetadata(postId: string) {
    this.metadataCollection.metadataModel
      .deleteOne({
        _id: postId,
      })
      .exec();
    return;
  }

  saveMetadata(content: UploadMessage) {
    //날라온 메세지 파싱
    const metadataDto = {
      _id: content.postId,
      userId: crypter.decrypt(content.userId),
      files: content.files,
    };
    return this.metadataCollection.saveMeatadata(metadataDto);
  }
}
