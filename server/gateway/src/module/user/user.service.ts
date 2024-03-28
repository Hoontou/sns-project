import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchedUser } from 'sns-interfaces/grpc.interfaces';
import { UserInfoBody } from 'src/app.service';
import { crypter } from 'src/common/crypter';
import { UserRepository } from './user.repo';
import { SearchService } from '../search/search.service';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private searchService: SearchService,
  ) {}

  async getUserinfo(body: UserInfoBody): Promise<
    | {
        userId: string;
        success: true;
        following: number;
        follower: number;
        postcount: number;
        img: string;
        introduce: string;
        username: string;
        introduceName: string;
      }
    | { success: false }
  > {
    //userId는 userinfo를 찾아서 올 아이디.
    //myId는 다른유저의 피드로 접근했을 시 다른유저를 팔로우했는지 찾을 용도.
    try {
      const result =
        body.type === 'myInfo'
          ? await this.userRepo.getUserinfoById(crypter.decrypt(body.userId))
          : await this.userRepo.getUserinfoByUsername(body.targetUsername);

      if (result === undefined) {
        console.log('getUserinfo is null, err at user.repo.ts');
        throw new NotFoundException();
      }

      return {
        ...result,
        userId: crypter.encrypt(result.id),
        success: true,
      };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  async getUsernameWithImg(userId: string): Promise<{
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

  async getUsernameWithImgList(userIds: string[]): Promise<{
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
      console.log('getUsernameWithImgList is null, err at user.repo.ts');
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
    userId: string;
    username: string;
  }): Promise<{ success: boolean; exist?: boolean }> {
    try {
      await this.userRepo.changeUsername(body);
      return { success: true };
    } catch (error) {
      console.log('user -> user.service.ts -> changeUsername 에서 err');
      console.log(error);
      if (error.code === '23505' || error.codeName === 'DuplicateKey') {
        //유니크 중복 코드, 앞에껀 postgres, 뒤에껀 mongo 코드임
        console.log('username 중복');
        return { success: false, exist: true };
      }

      return { success: false };
    }
  }
  /**자기소개 바꾸기 */
  async changeIntro(body: { userId: string; intro: string }) {
    try {
      await this.userRepo.changeIntro(body);
      return { success: true };
    } catch (err) {
      console.log('user -> user.service.ts -> changeIntro 에서 err');
      console.log(err);
      return { success: false };
    }
  }

  async changeIntroduceName(body: {
    introduceName: string;
    userId: string;
  }): Promise<{ success: boolean }> {
    try {
      await this.userRepo.changeIntroduceName(body);
      return { success: true };
    } catch (error) {
      console.log('user -> user.service.ts -> changeIntroduceName 에서 err');
      console.log(error);
      return { success: false };
    }
  }

  async searchUsersBySearchString(body: {
    searchString: string;
    page: number;
  }): Promise<{ userList: SearchedUser[] }> {
    const { userList } =
      await this.searchService.searchUsersBySearchString(body);

    if (userList === undefined) {
      return { userList: [] };
    }
    return { userList };
  }

  //api재사용한다. 나중에 새로 만들어서 쓰는게 좋을듯
  //필요없는 정보도 같이가져옴
  async getFollowCount(body: { username: string }) {
    const result = await this.userRepo.getUserinfoByUsername(body.username);

    if (!result) {
      console.log('getUserinfo is null, err at user.repo.ts');
      throw new NotFoundException();
    }

    return {
      userId: crypter.encrypt(result.id),
      follower: result.follower,
      following: result.following,
    };
  }

  decreatePostCount(data: { postId: string; userId: string }) {
    return this.userRepo.decreasePostCount(data);
  }
}
