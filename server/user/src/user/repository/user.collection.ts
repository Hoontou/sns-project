import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel, UserSchemaType } from '../schema/user.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class UserCollection {
  private logger = new Logger('UserCollection');
  constructor(public readonly db) {}

  createUser(data: {
    username: string;
    userId: number;
  }): Promise<UserSchemaType> {
    const createdUser = new this.db(data);
    return createdUser.save();
  }

  changeUsername(data: { username: string; userId: string }) {
    return this.db.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { username: data.username } },
    );
  }

  changeIntro(data: { userId: string; intro: string }) {
    return this.db.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { introduce: data.intro } },
    );
  }
  changeIntroduceName(data: { userId: string; introduceName: string }) {
    return this.db.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { introduceName: data.introduceName } },
    );
  }

  changeImg(data: { userId: string; img: string }) {
    return this.db.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { img: data.img } },
    );
  }
}
