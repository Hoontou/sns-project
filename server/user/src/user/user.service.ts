import { Injectable } from '@nestjs/common';
import { GetUserInfoData, UserRepository } from './user.repo';
import { UserinfoWithNums } from 'sns-interfaces/grpc.interfaces';
import { crypter } from 'src/common/crypter';

interface GetUserinfoById {
  type: 'byId';
  userId: string;
}
interface GetUserinfoByUsername {
  type: 'byUsername';
  username: string;
}

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUserinfo(
    data: GetUserinfoById | GetUserinfoByUsername,
  ): Promise<UserinfoWithNums> {
    const result: GetUserInfoData | undefined =
      data.type === 'byId'
        ? await this.userRepo.getUserinfoById(data.userId)
        : await this.userRepo.getUserinfoByUsername(data.username);

    if (result === undefined) {
      throw new Error('getUserinfo is null, err at user.repo.ts');
    }
    return { ...result, userId: crypter.encrypt(result.id) };
  }

  async getUsernameWithImg(data: {
    userId: string;
  }): Promise<{ username: string; img: string }> {
    const result: { username: string; img: string } | undefined =
      await this.userRepo.getUsernameWithImg(data.userId);

    if (result === undefined) {
      throw new Error('getUsernameWithImg is null, err at user.repo.ts');
    }
    return { username: result.username, img: result.img };
  }

  async getUsernameWithImgList(data: { userIds: string[] }): Promise<{
    userList: { username: string; img: string; userId: number }[];
  }> {
    const result:
      | { username: string; img: string; userId: number }[]
      | undefined = await this.userRepo.getUsernameWithImgList(data.userIds);

    if (result === undefined) {
      throw new Error('getUsernameWithImgList is null, err at user.repo.ts');
    }
    return {
      userList: result,
    };
  }

  async changeUsername(data: {
    userId: string;
    username: string;
  }): Promise<{ success: boolean; exist?: boolean }> {
    try {
      await this.userRepo.changeUsername(data);
      return { success: true };
    } catch (error) {
      if (error.code === 23505) {
        //유니크 중복 코드
        return { success: false, exist: true };
      }
      return { success: false };
    }
  }

  async changeIntro(data: { userId: string; intro: string }) {
    try {
      await this.userRepo.changeIntro(data);
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
