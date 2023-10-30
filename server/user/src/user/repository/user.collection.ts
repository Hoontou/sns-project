import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserCollection {
  private logger = new Logger('UserCollection');
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  createUser(data: { username: string; userId: number }): Promise<User> {
    const createdCat = new this.userModel(data);
    return createdCat.save();
  }

  changeUsername(data: { username: string; userId: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { username: data.username } },
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('username 업데이트 성공');
      },
    );
  }

  changeIntro(data: { userId: string; intro: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { introduce: data.intro } },
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('introduce 업데이트 성공');
      },
    );
  }
  changeIntroduceName(data: { userId: string; introduceName: string }) {
    return this.userModel.findOneAndUpdate(
      {
        userId: Number(data.userId),
      },
      { $set: { introduce: data.introduceName } },
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('introduceName 업데이트 성공');
      },
    );
  }
}
