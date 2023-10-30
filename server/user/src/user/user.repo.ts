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
import { UserCollection } from './repository/user.collection';
import { crypter } from 'src/common/crypter';

export interface GetUserInfoData {
  id: number;
  follower: number;
  following: number;
  postcount: number;
  img: string;
  introduce: string;
  username: string;
  introduceName: string;
}

@Injectable()
export class UserRepository {
  constructor(
    private dataSource: DataSource,
    public readonly userTable: UserTable,
    public readonly userinfoTable: UserinfoTable,
    public readonly usernumsTable: UsernumsTable,
    public readonly userCollection: UserCollection,
  ) {}

  /**pg삽입 후 엘라스틱 삽입 */
  async signUp(signUpDto: SignUpDto) {
    //데이터 파싱
    let newUser = new User();
    newUser.email = signUpDto.email;
    newUser.password = signUpDto.password;
    newUser = await newUser.save();

    const newUserinfo = new Userinfo();
    newUserinfo.username = signUpDto.username;

    const newUsernums = new Usernums();

    //포린키 매핑
    newUsernums.user = newUser;
    newUserinfo.user = newUser;

    //유저 먼저 생성 후
    //나머지 저장
    return Promise.all([
      newUserinfo.save(),
      newUsernums.save(),
      this.userCollection.createUser({
        username: signUpDto.username,
        userId: newUser.id,
      }),
    ]);
  }

  async getUserinfoById(userId: string): Promise<GetUserInfoData | undefined> {
    const query = `
    SELECT *
    FROM public.userinfo AS ui JOIN public.usernums 
    AS un ON ui."userId" = un."userId"
    WHERE ui."userId" = ${userId};
    `;
    const result = await pgdb.client.query(query);

    return { ...result.rows[0], introduceName: result.rows[0].introduce_name };
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
    console.log(result.rows[0]);
    return { ...result.rows[0], introduceName: result.rows[0].introduce_name };
  }

  async getUsernameWithImg(userId: string): Promise<Userinfo | undefined> {
    const query = `
    SELECT ui.username, ui.img, ui.introduce_name
    FROM public.userinfo AS ui
    WHERE ui."userId" = ${userId};
    `;
    const result = await pgdb.client.query(query);

    return { ...result.rows[0] };
  }

  async getUsernameWithImgList(userIds: string[]): Promise<
    | {
        username: string;
        img: string;
        userId: number;
        introduce_name: string;
      }[]
    | undefined
  > {
    const query = `
    SELECT ui.username, ui.img, ui."userId", ui.introduce_name
    FROM public.userinfo AS ui
    WHERE ui."userId" IN (${userIds});
    `;
    const result = await pgdb.client.query(query);

    return result.rows;
  }

  changeUsername(data: { userId: string; username: string }) {
    const decUserId = crypter.decrypt(data.userId);
    const form = { userId: decUserId, username: data.username };

    this.userinfoTable.changeUsername(form);
    this.userCollection.changeUsername(form);

    return;
  }

  changeIntro(data: { userId: string; intro: string }) {
    const decUserId = crypter.decrypt(data.userId);
    const form = { userId: decUserId, intro: data.intro };

    this.userinfoTable.changeIntro(form);
    this.userCollection.changeIntro(form);
    return;
  }

  changeIntroduceName(data: { userId: string; introduceName: string }) {
    const decUserId = crypter.decrypt(data.userId);
    const form = { userId: decUserId, introduceName: data.introduceName };

    this.userinfoTable.changeIntroduceName(form);
    this.userCollection.changeIntroduceName(form);
    return;
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
  decreasePostCount(data: { userId: string }) {
    return this.usernumsTable.decreasePostCount(data);
  }
}
