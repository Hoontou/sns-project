import { Injectable } from '@nestjs/common';
import { UserinfoTable } from './repository/userinfo.table';
import { UsernumsTable } from './repository/usernums.table';
import { UserTable } from './repository/user.table';
import { DataSource, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { Userinfo } from './entity/userinfo.entity';
import { Usernums } from './entity/usernums.entity';
import { SignUpDto } from 'src/auth/dto/sign.dto';
import { pgdb } from 'src/configs/pg';
import { UserinfoWithNums } from 'sns-interfaces/grpc.interfaces';
import { UploadMessage } from 'sns-interfaces';

export interface UserModuleTables {
  userTable: Repository<User>;
  userinfoTable: Repository<Userinfo>;
  usernumsTable: Repository<Usernums>;
}

@Injectable()
export class UserRepository {
  constructor(
    private dataSource: DataSource,

    public readonly userTable: UserTable,
    public readonly userinfoTable: UserinfoTable,
    public readonly usernumsTable: UsernumsTable,
  ) {}

  signUp(signUpDto: SignUpDto) {
    const newUser = new User();
    newUser.email = signUpDto.email;
    newUser.password = signUpDto.password;

    const newUserinfo = new Userinfo();
    newUserinfo.username = signUpDto.username;
    newUserinfo.user = newUser;

    const newUsernums = new Usernums();
    newUsernums.user = newUser;

    //트랜잭션 필요없을듯
    return Promise.all([
      newUser.save(),
      newUserinfo.save(),
      newUsernums.save(),
    ]);
  }

  async getUserinfo(userId: string): Promise<UserinfoWithNums | undefined> {
    const query = `
    SELECT *
    FROM public.userinfo AS ui JOIN public.usernums 
    AS un ON ui."userId" = un."userId"
    WHERE ui."userId" = ${userId};
    `;
    const result = await pgdb.client.query(query);

    return result.rows[0];
  }
  async getUsernameWithImg(userId: string): Promise<Userinfo | undefined> {
    const query = `
    SELECT ui.username, ui.img
    FROM public.userinfo AS ui
    WHERE ui."userId" = ${userId};
    `;
    const result = await pgdb.client.query(query);

    return result.rows[0];
  }

  async getUsernameWithImgList(
    userIds: string[],
  ): Promise<{ username: string; img: string; userId: number }[] | undefined> {
    const query = `
    SELECT ui.username, ui.img, ui."userId"
    FROM public.userinfo AS ui
    WHERE ui."userId" IN (${userIds});
    `;
    const result = await pgdb.client.query(query);

    return result.rows;
  }

  changeUsername(data: { userId: string; username: string }) {
    return this.userinfoTable.changeUsername(data.userId, data.username);
  }
  changeIntro(data: { userId: string; intro: string }) {
    return this.userinfoTable.changeIntro(data.userId, data.intro);
  }
  setImg(data: { userId: string; img: string }) {
    return this.userinfoTable.setImg(data.userId, data.img);
  }
  addFollow(data: { userTo: string; userFrom: string }) {
    return this.usernumsTable.addFollow(data);
  }
  removeFollow(data: { userTo: string; userFrom: string }) {
    return this.usernumsTable.removeFollow(data);
  }
  addPostCount(data: UploadMessage) {
    return this.usernumsTable.addPostCount(data);
  }
}
