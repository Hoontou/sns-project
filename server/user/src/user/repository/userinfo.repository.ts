import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { Userinfo } from '../entity/userinfo.entity';
import { UploadMessage } from 'sns-interfaces';
import { crypter } from 'src/common/crypter';

@Injectable()
export class UserinfoTable {
  private logger = new Logger('UserinfoTable');
  constructor(
    @InjectRepository(Userinfo)
    public db: Repository<Userinfo>,
    private dataSource: DataSource,
  ) {}

  async createUserNums(user: User) {
    const newUserNum: Userinfo = this.db.create({ user });
    this.db.save(newUserNum);
  }

  /**유저가 게시글 업로드 후 해당유저의 postcount +1 */
  async addPostCount(content: UploadMessage) {
    const id = crypter.decrypt(content.userId);
    await this.db
      .createQueryBuilder()
      .update(Userinfo)
      .set({
        postcount: () => 'postcount + 1',
      })
      .where('userId = :id', { id })
      .execute();

    this.logger.log(`userId ${id} postcount added`);
  }

  /**클라이언트의 Userinfo 컴포넌트에서의 요청. */
  async getUserinfo({ userId }: { userId: string }): Promise<{
    follower: number;
    following: number;
    postcount: number;
    img: string;
    introduce: string;
    username: string;
  }> {
    const userinfo = await this.dataSource
      .getRepository(Userinfo)
      .createQueryBuilder('userinfo')
      .innerJoinAndSelect('userinfo.user', 'user')
      .where('userinfo.userId = :id', { id: userId })
      .getOne();

    if (userinfo === null) {
      throw new Error('userinfo are null, at userinfo.repo.ts');
    }

    return {
      follower: userinfo.follower,
      following: userinfo.following,
      postcount: userinfo.postcount,
      username: userinfo.user.username,
      img: userinfo.img,
      introduce: userinfo.introduce,
    };
  }

  async addFollow(data: { userTo: string; userFrom: string }) {
    const to = crypter.decrypt(data.userTo);
    const from = crypter.decrypt(data.userFrom);

    await this.db
      .createQueryBuilder()
      .update(Userinfo)
      .set({
        follower: () => 'follower + 1',
      })
      .where('userId = :id', { id: to })
      .execute();

    await this.db
      .createQueryBuilder()
      .update(Userinfo)
      .set({
        following: () => 'following + 1',
      })
      .where('userId = :id', { id: from })
      .execute();

    this.logger.log(`follow added userTo:${to}, userFrom:${from}`);
  }

  async removeFollow(data: { userTo: string; userFrom: string }) {
    const to = crypter.decrypt(data.userTo);
    const from = crypter.decrypt(data.userFrom);
    await this.db
      .createQueryBuilder()
      .update(Userinfo)
      .set({
        follower: () => 'follower - 1',
      })
      .where('userId = :id', { id: to })
      .execute();

    await this.db
      .createQueryBuilder()
      .update(Userinfo)
      .set({
        following: () => 'following - 1',
      })
      .where('userId = :id', { id: from })
      .execute();

    this.logger.log(`follow removed userTo:${to}, userFrom:${from}`);
  }
}
