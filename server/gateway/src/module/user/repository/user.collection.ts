import { Injectable, Logger } from '@nestjs/common';
import { UserDocument, UserSchemaDefinition } from '../schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserCollection {
  private logger = new Logger('UserCollection');
  constructor(@InjectModel('user') private userModel: Model<UserDocument>) {}

  createUser(data: {
    username: string;
    userId: number;
  }): Promise<UserSchemaDefinition> {
    const createdUser = new this.userModel(data);
    return createdUser.save();
  }

  changeUsername(data: { username: string; userId: number }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { username: data.username } },
    );
  }

  changeIntro(data: { userId: number; intro: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { introduce: data.intro } },
    );
  }
  changeIntroduceName(data: { userId: number; introduceName: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { introduceName: data.introduceName } },
    );
  }

  changeImg(data: { userId: number; img: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { img: data.img } },
    );
  }

  async getUserIdsByUsernames(usernames: string[]): Promise<number[]> {
    const result = await this.userModel.find({
      username: { $in: usernames },
    });

    const userIds = result.map((item) => {
      return item.userId;
    });

    return userIds;
  }
}
