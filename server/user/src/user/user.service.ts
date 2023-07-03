import { Injectable } from '@nestjs/common';
import { UserinfoTable } from './repository/userinfo.repository';
import { UserTable } from './repository/user.repository';
import { Userinfo } from './entity/userinfo.entity';
import { crypter } from 'src/common/crypter';

@Injectable()
export class UserService {
  constructor(
    private userinfoTable: UserinfoTable,
    private userTable: UserTable,
  ) {}

  async getUserinfo(data: { userId: string }): Promise<{
    follower: number;
    following: number;
    postcount: number;
    img: string;
    introduce: string;
    username: string;
  }> {
    const userinfo: Userinfo | null = await this.userinfoTable.getUserinfo(
      data.userId,
    );

    if (userinfo === null) {
      throw new Error('userinfo are null');
    }

    //파싱후 리턴
    return {
      follower: userinfo.follower,
      following: userinfo.following,
      postcount: userinfo.postcount,
      username: userinfo.user.username,
      img: userinfo.img,
      introduce: userinfo.introduce,
    };
  }

  async getUsernameWithImgList(data: { userIds: string[] }): Promise<{
    userList: { username: string; img: string; userId: number }[];
  }> {
    const result: Userinfo[] = await this.userinfoTable.getUsernameWithImgList(
      data.userIds,
    );

    if (result === null) {
      throw new Error('userinfo list is null');
    }
    //파싱후 리턴
    return {
      userList: result.map((item) => {
        return {
          img: item.img,
          username: item.user.username,
          userId: item.user.id,
        };
      }),
    };
  }
  async getUsernameWithImg(data: {
    userId: string;
  }): Promise<{ username: string; img: string }> {
    const result: Userinfo | null = await this.userinfoTable.getUsernameWithImg(
      data.userId,
    );
    if (result === null) {
      throw new Error('username is null, err at user.repo.ts');
    }
    return { username: result.user.username, img: result.img };
  }

  async changeUsername(data: {
    userId: string;
    username: string;
  }): Promise<{ success: boolean; exist?: boolean }> {
    try {
      const checkedUser = await this.userTable.db.findOneBy({
        username: data.username,
      });
      //username이 이미 쓰고있으면
      if (checkedUser !== null) {
        return { success: false, exist: true };
      }

      //userId로 유저 찾아서
      const user = await this.userTable.db.findOneBy({
        id: Number(crypter.decrypt(data.userId)),
      });
      if (!user) {
        return { success: false }; // user가 없는 경우,
      }
      //username바꾸고 저장
      user.username = data.username;
      await this.userTable.db.save(user);

      //성공 리턴
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }
}
