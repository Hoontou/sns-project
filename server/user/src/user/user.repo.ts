import { Injectable } from '@nestjs/common';
import { UserinfoTable } from './repository/userinfo.table';
import { UsernumsTable } from './repository/usernums.table';
import { UserTable } from './repository/user.table';
import { DataSource } from 'typeorm';
import { User } from './entity/user.entity';
import { Userinfo } from './entity/userinfo.entity';
import { Usernums } from './entity/usernums.entity';
import { SignUpDto } from 'src/auth/dto/sign.dto';
import { pgdb } from 'src/configs/pg';
import { UserinfoWithNums } from 'sns-interfaces/grpc.interfaces';
import { UploadMessage } from 'sns-interfaces';
import { SnsUsersDocType, elastic } from 'src/configs/elasticsearch';

export interface GetUserInfoData {
  id: number;
  follower: number;
  following: number;
  postcount: number;
  img: string;
  introduce: string;
  username: string;
}

@Injectable()
export class UserRepository {
  constructor(
    private dataSource: DataSource,
    public readonly userTable: UserTable,
    public readonly userinfoTable: UserinfoTable,
    public readonly usernumsTable: UsernumsTable,
  ) {}

  /**pg삽입 후 엘라스틱 삽입 */
  async signUp(signUpDto: SignUpDto) {
    //데이터 파싱
    let newUser = new User();
    newUser.email = signUpDto.email;
    newUser.password = signUpDto.password;
    newUser = await newUser.save();

    let newUserinfo = new Userinfo();
    newUserinfo.username = signUpDto.username;

    let newUsernums = new Usernums();

    //포린키 매핑
    newUsernums.user = newUser;
    newUserinfo.user = newUser;

    //유저 먼저 생성 후
    //나머지 저장, 트랜잭션 필요없을듯
    [newUserinfo, newUsernums] = await Promise.all([
      newUserinfo.save(),
      newUsernums.save(),
    ]);

    //pgdb삽입 후 이제 엘라스틱에 삽입
    const newUserDoc: SnsUsersDocType = {
      username: signUpDto.username,
      introduce: '',
      userId: newUser.id,
      img: '',
    };

    //doc id는 pgdb usertable id로.
    await elastic.client.index({
      index: elastic.SnsUsersIndex,
      id: newUserDoc.userId,
      document: newUserDoc,
    });
  }

  async getUserinfoById(userId: string): Promise<GetUserInfoData | undefined> {
    const query = `
    SELECT *
    FROM public.userinfo AS ui JOIN public.usernums 
    AS un ON ui."userId" = un."userId"
    WHERE ui."userId" = ${userId};
    `;
    const result = await pgdb.client.query(query);

    return result.rows[0];
  }

  async getUserinfoByUsername(
    username: string,
  ): Promise<GetUserInfoData | undefined> {
    const query = `
    SELECT *
    FROM public.userinfo AS ui JOIN public.usernums 
    AS un ON ui."userId" = un."userId"
    WHERE ui.username = '${username}';
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
