import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  MetadataDocument,
  MetadataSchemaDefinition,
} from './schema/metadata.schema';
import { crypter } from '../../../common/crypter';

export interface MetadataDto {
  _id: string;
  userId: number | string;
  files: string[];
  createdAt: string | Date;
}

export const emptyMetadata: Readonly<MetadataDto> = {
  _id: '',
  userId: 0,
  files: [],
  createdAt: '',
};

@Injectable()
export class MetadataCollection {
  private logger = new Logger(MetadataCollection.name);
  constructor(
    @InjectModel('metadata')
    public readonly metadataModel: Model<MetadataDocument>,
  ) {}

  async getMetadatas(data: { userId: string; page: number }) {
    const len = 12; //가져올 갯수
    const metadatas = await this.metadataModel
      .find({
        userId: data.userId ? crypter.decrypt(data.userId) : '',
      })
      .sort({ _id: -1 })
      .limit(len)
      .skip(data.page * len)
      .lean();

    const tmp = metadatas.map((item: MetadataSchemaDefinition) => {
      return {
        ...item,
        userId: crypter.encrypt(item.userId),
        _id: item._id.toString(),
      };
    });

    return {
      metadatas: tmp,
    };
  }

  async getMetadatasLast3Day(data: {
    userIds: number[];
    page: number;
  }): Promise<{ metadatas: MetadataDto[] }> {
    const len = 10; //가져올 갯수
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); //3일전 까지의 게시물

    const metadatas: MetadataSchemaDefinition[] = await this.metadataModel
      //3일 안으로, 10개씩
      .find({
        userId: { $in: data.userIds },
        createdAt: { $gte: threeDaysAgo },
      })
      .sort({ _id: -1 })
      .limit(len)
      .skip(data.page * len)
      .lean();

    return {
      metadatas: metadatas.map((item) => {
        return {
          ...item,
          _id: item._id.toString(),
        };
      }),
    };
  }

  async getMetadatasByPostId(
    _ids: string[],
  ): Promise<{ metadatas: MetadataDto[] }> {
    const metadatas: MetadataSchemaDefinition[] = await this.metadataModel
      .find({
        _id: { $in: _ids },
      })
      .sort({ _id: -1 })
      .lean();

    return {
      metadatas: metadatas.map((item) => {
        return {
          ...item,
          userId: crypter.encrypt(item.userId),
          _id: item._id.toString(),
        };
      }),
    };
  }

  saveMeatadata(metadataDto) {
    const newOne = new this.metadataModel(metadataDto);
    newOne
      .save()
      .then(() => {
        // this.logger.debug('meatadata stored in mongo successfully');
      })
      .catch(() => this.logger.error('err when storing metadata in mongo'));
  }

  async getMetadatasOrderByDate(data: { by: 'last' | 'first'; page: number }) {
    const len = 12; //가져올 갯수
    const metadatas = await this.metadataModel
      .find()
      .sort({ _id: data.by === 'last' ? -1 : 1 })
      .limit(len)
      .skip(data.page * len)
      .lean();

    const tmp: MetadataDto[] = metadatas.map(
      (item: MetadataSchemaDefinition) => {
        return {
          ...item,
          userId: crypter.encrypt(item.userId),
          _id: item._id.toString(),
        };
      },
    );

    return {
      metadatas: tmp,
    };
  }
}
