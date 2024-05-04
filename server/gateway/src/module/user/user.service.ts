import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { crypter } from 'src/common/crypter';
import { UserRepository } from './user.repo';
import { UploadMessage } from 'sns-interfaces';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(private userRepo: UserRepository) {}

  async getUsernameWithImg(userId: number): Promise<{
    username: string;
    img: string;
    userId: number;
    introduceName: string;
  }> {
    //요청온게 name인지 id인지 보고 메서드 선택함

    const result:
      | { username: string; img: string; introduce_name: string }
      | undefined = await this.userRepo.getUsernameWithImg(userId);

    if (result === undefined) {
      throw new Error('getUsernameWithImg is null, err at user.repo.ts');
    }
    return {
      username: result.username,
      img: result.img,
      introduceName: result.introduce_name,
      userId: Number(userId),
    };
  }

  async getUsernameWithImgList(userIds: number[]): Promise<{
    userList: { username: string; img: string; userId: number }[];
  }> {
    const result:
      | {
          username: string;
          img: string;
          userId: number;
          introduce_name: string;
        }[]
      | undefined = await this.userRepo.getUsernameWithImgList(userIds);

    if (result === undefined) {
      this.logger.error('getUsernameWithImgList is null, err at user.repo.ts');
      throw new NotFoundException();
    }
    const tmp = result.map((item) => {
      return { ...item, introduceName: item.introduce_name };
    });
    return {
      userList: tmp,
    };
  }

  async changeUsername(body: {
    userId: number;
    username: string;
  }): Promise<{ success: boolean; exist?: boolean }> {
    try {
      await this.userRepo.changeUsername(body);
      return { success: true };
    } catch (error) {
      this.logger.error('user -> user.service.ts -> changeUsername 에서 err');
      this.logger.error(error);
      if (error.code === '23505' || error.codeName === 'DuplicateKey') {
        //유니크 중복 코드, 앞에껀 postgres, 뒤에껀 mongo 코드임
        this.logger.error('username 중복');
        return { success: false, exist: true };
      }

      return { success: false };
    }
  }
  /**자기소개 바꾸기 */
  async changeIntro(body: { userId: number; intro: string }) {
    try {
      await this.userRepo.changeIntro(body);
      return { success: true };
    } catch (err) {
      this.logger.error('user -> user.service.ts -> changeIntro 에서 err');
      this.logger.error(err);
      return { success: false };
    }
  }

  async changeIntroduceName(body: {
    introduceName: string;
    userId: number;
  }): Promise<{ success: boolean }> {
    try {
      await this.userRepo.changeIntroduceName({
        ...body,
        introduceName: body.introduceName,
      });
      return { success: true };
    } catch (error) {
      this.logger.error(
        'user -> user.service.ts -> changeIntroduceName 에서 err',
      );
      this.logger.error(error);
      return { success: false };
    }
  }

  //api재사용한다. 나중에 새로 만들어서 쓰는게 좋을듯
  //필요없는 정보도 같이가져옴
  async getFollowCount(body: { username: string }) {
    const result = await this.userRepo.getUserinfoByUsername(body.username);

    if (!result) {
      this.logger.error('getUserinfo is null, err at user.repo.ts');
      throw new NotFoundException();
    }

    return {
      userId: crypter.encrypt(result.userId),
      follower: result.follower,
      following: result.following,
    };
  }

  getUserinfoByUsername(username) {
    return this.userRepo.getUserinfoByUsername(username);
  }

  getUserinfoById(userId) {
    return this.userRepo.getUserinfoById(userId);
  }

  getUserIdsByUsernames(usernames: string[]) {
    return this.userRepo.getUserIdsByUsernames(usernames);
  }

  increaseFollowCount(data: { userTo: number; userFrom: number }) {
    return this.userRepo.increaseFollowCount(data);
  }

  decreaseFollowCount(data: { userTo: number; userFrom: number }) {
    return this.userRepo.decreaseFollowCount(data);
  }

  increasePostCount(data: UploadMessage) {
    return this.userRepo.increasePostCount(data);
  }

  decreasePostCount(data: { userId: string }) {
    return this.userRepo.decreasePostCount(data);
  }

  changeImg(data: { userId: string; img: string }) {
    this.userRepo.changeImg(data);
    return;
  }
}
