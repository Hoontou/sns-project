import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserCollection {
  private logger = new Logger('UserCollection');
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  createUser(data: { username: string; userId: number }): Promise<User> {
    const createdUser = new this.userModel(data);
    return createdUser.save();
  }

  changeUsername(data: { username: string; userId: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { username: data.username } },
    );
  }

  changeIntro(data: { userId: string; intro: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { introduce: data.intro } },
    );
  }
  changeIntroduceName(data: { userId: string; introduceName: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { introduceName: data.introduceName } },
    );
  }

  changeImg(data: { userId: string; img: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { img: data.img } },
    );
  }
}
