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
import { SearchService } from '../search/search.service';
import { SnsUsersUpdateForm } from '../search/types/search.types';

export interface GetUserInfoData {
  userId: number;
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
    private searchService: SearchService,
  ) {}

  /**pg삽입 후 엘라스틱 삽입 */
  async signUp(signUpDto: SignUpDto) {
    //데이터 파싱
    const newUser = new User();
    newUser.email = signUpDto.email;
    newUser.password = signUpDto.password;
    await this.userTable.db.save(newUser);

    const newUserinfo = new Userinfo();
    newUserinfo.username = signUpDto.username;

    const newUsernums = new Usernums();

    //포린키 매핑
    newUsernums.user = newUser;
    newUserinfo.user = newUser;

    //유저 먼저 생성 후
    //나머지 저장
    return Promise.all([
      this.userinfoTable.db.save(newUserinfo),
      this.usernumsTable.db.save(newUsernums),
      this.userCollection
        .createUser({
          username: signUpDto.username,
          userId: newUser.id,
        })
        .then(async (doc) => {
          const userDocDto = {
            username: doc.username,
            introduce: doc.introduce,
            img: doc.img,
            introduceName: doc.introduceName,
          };
          await this.searchService.insertUser(doc._id.toString(), userDocDto);
          return doc;
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

  changeUsername(data: { userId: number; username: string }) {
    const form = { userId: data.userId, username: data.username };

    return Promise.all([
      this.userinfoTable.changeUsername(form),
      this.userCollection.changeUsername(form).then(async (doc) => {
        if (!doc) {
          return doc;
        }

        const form: SnsUsersUpdateForm = {
          username: data.username,
        };
        await this.searchService.updateUser(doc?._id.toString(), form);

        return doc;
      }),
    ]);
  }

  changeIntro(data: { userId: number; intro: string }) {
    const form = { userId: data.userId, intro: data.intro };

    return Promise.all([
      this.userinfoTable.changeIntro(form),
      this.userCollection.changeIntro(form).then(async (doc) => {
        if (!doc) {
          return doc;
        }

        const form: SnsUsersUpdateForm = {
          introduce: data.intro,
        };
        await this.searchService.updateUser(doc?._id.toString(), form);

        return doc;
      }),
    ]);
  }

  changeIntroduceName(data: { userId: number; introduceName: string }) {
    const form = { userId: data.userId, introduceName: data.introduceName };

    return Promise.all([
      this.userinfoTable.changeIntroduceName(form),
      this.userCollection.changeIntroduceName(form).then(async (doc) => {
        if (!doc) {
          return doc;
        }

        const form: SnsUsersUpdateForm = {
          introduceName: data.introduceName,
        };
        await this.searchService.updateUser(doc?._id.toString(), form);

        return doc;
      }),
    ]);
  }

  changeImg(data: { userId: string; img: string }) {
    const decUserId = crypter.decrypt(data.userId);
    const form = { userId: decUserId, img: data.img };

    return Promise.all([
      this.userinfoTable.changeImg(form),
      this.userCollection.changeImg(form).then(async (doc) => {
        if (!doc) {
          return doc;
        }

        const form: SnsUsersUpdateForm = {
          img: data.img,
        };
        await this.searchService.updateUser(doc?._id.toString(), form);

        return doc;
      }),
    ]).catch((err) => {
      console.log('user -> user.repo.ts -> changeImg 에서 err');
      console.log(err);
    });
  }

  increaseFollowCount(data: { userTo: number; userFrom: number }) {
    return this.usernumsTable.increaseFollowCount(data);
  }
  decreaseFollowCount(data: { userTo: number; userFrom: number }) {
    return this.usernumsTable.decreaseFollowCount(data);
  }
  increasePostCount(data: UploadMessage) {
    return this.usernumsTable.increasePostCount(data);
  }
  decreasePostCount(data: { userId: string }) {
    return this.usernumsTable.decreasePostCount(data);
  }

  getUserIdsByUsernames(usernames: string[]) {
    return this.userCollection.getUserIdsByUsernames(usernames);
  }
}
