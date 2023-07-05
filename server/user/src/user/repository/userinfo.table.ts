import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Userinfo } from '../entity/userinfo.entity';
import { UploadMessage } from 'sns-interfaces';
import { crypter } from 'src/common/crypter';
import { pgdb } from 'src/configs/pg';

@Injectable()
export class UserinfoTable {
  private logger = new Logger('UserinfoTable');
  constructor(
    @InjectRepository(Userinfo)
    public readonly db: Repository<Userinfo>,
    private dataSource: DataSource,
  ) {}

  changeUsername(userId: string, username: string) {
    const query = `
    UPDATE public.userinfo
    SET username = '${username}'
    WHERE "userId" = ${crypter.decrypt(userId)};
    `;
    return pgdb.client.query(query);
  }

  changeIntro(userId: string, intro: string) {
    const query = `
    UPDATE public.userinfo
    SET introduce = '${intro}'
    WHERE "userId" = ${crypter.decrypt(userId)};
    `;
    return pgdb.client.query(query);
  }
  setImg(userId: string, img: string) {
    const query = `
    UPDATE public.userinfo
    SET img = '${img}'
    WHERE "userId" = ${crypter.decrypt(userId)};
    `;
    return pgdb.client.query(query);
  }

  //usernums 삽입을 트리거로 대체해서 아래 코드는 비활성화. 추후 삭제해야함
  // async createUserNums(
  //   user: User,
  // ): Promise<{ success: boolean; msg?: string }> {
  //   const newUserNum: Userinfo = this.db.create({ user });
  //   try {
  //     await this.db.save(newUserNum);
  //   } catch (error) {
  //     console.log('err at userinfo.repo.ts');
  //     throw new Error('1');
  //   }
  // }

  /**유저가 게시글 업로드 후 해당유저의 postcount +1 */
  // async addPostCount(content: UploadMessage) {
  //   const id = crypter.decrypt(content.userId);
  //   await this.db
  //     .createQueryBuilder()
  //     .update(Userinfo)
  //     .set({
  //       postcount: () => 'postcount + 1',
  //     })
  //     .where('userId = :id', { id })
  //     .execute();

  //   this.logger.log(`userId ${id} postcount added`);
  //   return;
  // }

  // /**클라이언트의 Userinfo 컴포넌트에서의 요청. */
  // getUserinfo(userId: string): Promise<Userinfo | null> {
  //   return this.dataSource
  //     .getRepository(Userinfo)
  //     .createQueryBuilder('userinfo')
  //     .innerJoinAndSelect('userinfo.user', 'user')
  //     .where('userinfo.userId = :id', { id: userId })
  //     .getOne();
  // }

  // async addFollow(data: { userTo: string; userFrom: string }) {
  //   const to = crypter.decrypt(data.userTo);
  //   const from = crypter.decrypt(data.userFrom);

  //   await this.db
  //     .createQueryBuilder()
  //     .update(Userinfo)
  //     .set({
  //       follower: () => 'follower + 1',
  //     })
  //     .where('userId = :id', { id: to })
  //     .execute();

  //   await this.db
  //     .createQueryBuilder()
  //     .update(Userinfo)
  //     .set({
  //       following: () => 'following + 1',
  //     })
  //     .where('userId = :id', { id: from })
  //     .execute();

  //   this.logger.log(`follow added userTo:${to}, userFrom:${from}`);
  //   return;
  // }

  // async removeFollow(data: { userTo: string; userFrom: string }) {
  //   const to = crypter.decrypt(data.userTo);
  //   const from = crypter.decrypt(data.userFrom);
  //   await this.db
  //     .createQueryBuilder()
  //     .update(Userinfo)
  //     .set({
  //       follower: () => 'follower - 1',
  //     })
  //     .where('userId = :id', { id: to })
  //     .execute();

  //   await this.db
  //     .createQueryBuilder()
  //     .update(Userinfo)
  //     .set({
  //       following: () => 'following - 1',
  //     })
  //     .where('userId = :id', { id: from })
  //     .execute();

  //   this.logger.log(`follow removed userTo:${to}, userFrom:${from}`);
  //   return;
  // }

  // getUsernameWithImg(userId: string): Promise<Userinfo | null> {
  //   return this.db
  //     .createQueryBuilder('userinfo')
  //     .innerJoin('userinfo.user', 'user')
  //     .select(['userinfo.img', 'user.username'])
  //     .where('userinfo.userId = :id', { id: userId })
  //     .getOne();
  // }

  // getUsernameWithImgList(userIds: string[]) {
  //   return this.db
  //     .createQueryBuilder('userinfo')
  //     .innerJoin('userinfo.user', 'user')
  //     .select(['userinfo.img', 'user.id', 'user.username'])
  //     .where('userinfo.userId IN (:...ids)', { ids: userIds })
  //     .getMany();
  // }

  // async changeIntro(data: {
  //   userId: string;
  //   intro: string;
  // }): Promise<{ success: boolean }> {
  //   try {
  //     await this.db
  //       .createQueryBuilder()
  //       .update(Userinfo)
  //       .set({ introduce: data.intro })
  //       .where('userId = :id', { id: crypter.decrypt(data.userId) })
  //       .execute();
  //   } catch (error) {
  //     console.log(error, 'err when changeIntro, db err');
  //     return { success: false };
  //   }

  //   return { success: true };
  // }

  // setImg(data: { userId: string; img: string }) {
  //   return this.db
  //     .createQueryBuilder()
  //     .update(Userinfo)
  //     .set({ img: data.img })
  //     .where('userId = :id', { id: crypter.decrypt(data.userId) })
  //     .execute();
  // }
}
