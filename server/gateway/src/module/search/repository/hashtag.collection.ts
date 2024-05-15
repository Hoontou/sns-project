import { Injectable, NotFoundException } from '@nestjs/common';
import { HashtagDocument } from './hashtag.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class HashtagCollection {
  constructor(
    @InjectModel('hashtag') private hashtagModel: Model<HashtagDocument>,
  ) {}

  async insertTagReturning_id(tagName: string) {
    const doc = new this.hashtagModel({ tagName });
    await doc.save();

    return doc._id.toString();
  }

  async getTagCountBy_id(_id: string) {
    const doc = await this.hashtagModel.findById(_id);

    if (!doc) {
      console.log('cannot find hashtag doc on mongo');
      console.trace();
      throw new Error('cannot find hashtag doc on mongo');
    }
    return doc.count;
  }

  async getTagDocByTagName(tagName: string): Promise<HashtagDocument> {
    const doc = await this.hashtagModel.findOne({ tagName });

    if (!doc) {
      console.log('cannot find hashtag doc on mongo');
      console.trace();
      throw new NotFoundException('cannot find hashtag doc on mongo');
    }
    return doc;
  }

  incrementTagCountByTagName(tagName): Promise<HashtagDocument | null> {
    return this.hashtagModel.findOneAndUpdate(
      { tagName },
      {
        $inc: { count: 1 },
      },
    );
  }

  async decrementTagCount(tagName) {
    await this.hashtagModel.findOneAndUpdate(
      { tagName },
      {
        $inc: { count: -1 },
      },
    );
    return;
  }
}
