import { Injectable, Logger } from '@nestjs/common';
import { UserinfoTable } from './repository/userinfo.table';
import { UsernumsTable } from './repository/usernums.table';
import { UserTable } from './repository/user.table';
import { User } from './entity/user.entity';
import { Userinfo } from './entity/userinfo.entity';
import { Usernums } from './entity/usernums.entity';
import { SignUpDto } from '../auth/dto/sign.dto';
import { UploadMessage } from 'sns-interfaces';
import { UserCollection } from './repository/user.collection';
import { crypter } from 'src/common/crypter';
import { pgdb } from '../../configs/postgres';

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
  private logger = new Logger(UserRepository.name);

  constructor(
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

    if (result.rows.length === 0) {
      return undefined;
    }

    return { ...result.rows[0], introduceName: result.rows[0].introduce_name };
  }

  /**몽고로 대체 가능 */
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

    if (result.rows.length === 0) {
      return undefined;
    }
    return { ...result.rows[0], introduceName: result.rows[0].introduce_name };
  }

  /**몽고로 대체 가능 */
  async getUsernameWithImg(userId: number): Promise<Userinfo | undefined> {
    const query = `
    SELECT ui.username, ui.img, ui.introduce_name
    FROM public.userinfo AS ui
    WHERE ui."userId" = ${userId};
    `;
    const result = await pgdb.client.query(query);

    return { ...result.rows[0] };
  }

  async getUserIdWithUsernameByEmail(
    email: string,
  ): Promise<{ username: string; id: number } | undefined> {
    const query = `
    SELECT ui.username, u.id
    FROM public.user AS u
    JOIN public.userinfo AS ui ON ui."userId" = u.id
    WHERE u.email = '${email}';
    `;
    const result = await pgdb.client.query(query);

    return { ...result.rows[0] };
  }

  /**몽고로 대체 가능 곧 수정할 예정 */
  async getUsernameWithImgList(userIds: number[]): Promise<
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

    return Promise.all([
      this.userinfoTable.changeUsername(form),
      this.userCollection.changeUsername(form),
    ]);
  }

  changeIntro(data: { userId: string; intro: string }) {
    const decUserId = crypter.decrypt(data.userId);
    const form = { userId: decUserId, intro: data.intro };

    return Promise.all([
      this.userinfoTable.changeIntro(form),
      this.userCollection.changeIntro(form),
    ]);
  }

  changeIntroduceName(data: { userId: string; introduceName: string }) {
    const decUserId = crypter.decrypt(data.userId);
    const form = { userId: decUserId, introduceName: data.introduceName };

    return Promise.all([
      this.userinfoTable.changeIntroduceName(form),
      this.userCollection.changeIntroduceName(form),
    ]);
  }

  changeImg(data: { userId: string; img: string }) {
    const decUserId = crypter.decrypt(data.userId);
    const form = { userId: decUserId, img: data.img };

    return Promise.all([
      this.userinfoTable.changeImg(form),
      this.userCollection.changeImg(form),
    ]).catch((err) => {
      console.log('user -> user.repo.ts -> changeImg 에서 err');
      console.log(err);
    });
  }

  addFollow(data: { userTo: number; userFrom: number }) {
    return this.usernumsTable.addFollow(data);
  }
  removeFollow(data: { userTo: number; userFrom: number }) {
    return this.usernumsTable.removeFollow(data);
  }
  addPostCount(data: UploadMessage) {
    return this.usernumsTable.addPostCount(data);
  }
  decreasePostCount(data: { userId: string }) {
    return this.usernumsTable.decreasePostCount(data);
  }
}
