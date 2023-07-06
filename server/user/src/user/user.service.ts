import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repo';
import { UserinfoWithNums } from 'sns-interfaces/grpc.interfaces';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUserinfo(data: { userId: string }): Promise<UserinfoWithNums> {
    const result: UserinfoWithNums | undefined =
      await this.userRepo.getUserinfo(data.userId);

    if (result === undefined) {
      throw new Error('getUserinfo is null, err at user.repo.ts');
    }
    return { ...result };
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
