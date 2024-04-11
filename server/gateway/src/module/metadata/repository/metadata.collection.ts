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
    userIds: string[];
    page: number;
  }): Promise<{ metadatas: MetadataDto[] }> {
    const len = 10; //가져올 갯수
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); //3일전 까지의 게시물

    const userIds = data.userIds?.map((i) => {
      return crypter.decrypt(i);
    });

    const metadatas = (await this.metadataModel
      //3일 안으로, 10개씩
      .find({
        userId: { $in: userIds },
        createdAt: { $gte: threeDaysAgo },
      })
      .sort({ _id: -1 })
      .limit(len)
      .skip(data.page * len)
      .exec()) as any;

    const tmp: MetadataDto[] = metadatas;

    return { metadatas: tmp };
  }

  async getMetadatasByPostId(_ids: string[]) {
    const metadatas: MetadataDto[] = (await this.metadataModel
      .find({
        _id: { $in: _ids },
      })
      .sort({ _id: -1 })) as any;

    return {
      metadatas: metadatas.map((item) => {
        item.userId = crypter.encrypt(item.userId);
        return item;
      }),
    };
  }

  async saveMeatadata(metadataDto) {
    const newOne = await new this.metadataModel(metadataDto);
    await newOne
      .save()
      .then(() => {
        // this.logger.debug('meatadata stored in mongo successfully');
      })
      .catch(() => this.logger.error('err when storing metadata in mongo'));
    //Document만들어서 저장까지 해준다. 비동기처리로 하게하고 함수는 그냥 반환.
    return newOne;
  }

  async getMetadatasOrderByDate(data: { by: 'last' | 'first'; page: number }) {
    const len = 12; //가져올 갯수
    const metadatas = await this.metadataModel
      .find()
      .sort({ _id: data.by === 'last' ? -1 : 1 })
      .limit(len)
      .skip(data.page * len);

    const tmp = metadatas.map((item: any) => {
      item.userId = crypter.encrypt(item.userId);
      return item;
    }) as MetadataDto[];

    return {
      metadatas: tmp,
    };
  }
}
