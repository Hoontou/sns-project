import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { crypter } from 'src/common/crypter';
import {
  MetadataCollection,
  MetadataDto,
} from './repository/metadata.collection';
import { UploadMessage } from 'sns-interfaces';
import { PostService } from '../post/post.service';
import { FflService } from '../ffl/ffl.service';

@Injectable()
export class MetadataService {
  private logger = new Logger(MetadataService.name);

  constructor(
    @Inject(forwardRef(() => AppService))
    private appService: AppService,
    private metadataCollection: MetadataCollection,
    private postService: PostService,
    private fflService: FflService,
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

  async getMetadatasOrderByDate(body: { by: 'last' | 'first'; page: number }) {
    const { metadatas } =
      await this.metadataCollection.getMetadatasOrderByDate(body);
    if (metadatas.length === 0) {
      return { metadatas: [] };
    }
    return { metadatas };
  }

  async getMetadatasOrderByLikes(body: { page: number }) {
    const _idsOrderedByLikes =
      await this.postService.getPostIdsOrderByLikes(body);
    const { metadatas } = await this.getMetadatasByPostId(_idsOrderedByLikes);

    return { metadatas };
  }

  async getMyCollection(data: { page: number; userId: string }) {
    const myCollections = await this.fflService.getMyLikes(data);

    return { metadatas: myCollections };
  }
}
