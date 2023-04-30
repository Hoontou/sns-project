import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { Usernums } from '../entity/usernums.entity';
import { UploadMessage } from 'sns-interfaces';
import { crypter } from 'src/common/crypter';

@Injectable()
export class UsernumsTable {
  private logger = new Logger('UsernumsTable');
  constructor(
    @InjectRepository(Usernums)
    public db: Repository<Usernums>,
    private dataSource: DataSource,
  ) {}

  async createUserNums(user: User) {
    const newUserNum: Usernums = this.db.create({ user });
    this.db.save(newUserNum);
  }

  /**유저가 게시글 업로드 후 해당유저의 postcount +1 */
  async addPostCount(content: UploadMessage) {
    const id = crypter.decrypt(content.userId);
    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        postcount: () => 'postcount + 1',
      })
      .where('userId = :id', { id })
      .execute();

    this.logger.log(`userId ${id} postcount added`);
  }

  /**클라이언트의 Userinfo 컴포넌트에서의 요청. */
  async getUsernumsFromUserId(userId: string): Promise<{
    follower: number;
    following: number;
    postcount: number;
    username: string;
  }> {
    const usernums = await this.dataSource
      .getRepository(Usernums)
      .createQueryBuilder('usernums')
      .innerJoinAndSelect('usernums.user', 'user')
      .where('usernums.userId = :id', { id: userId })
      .getOne();
    if (usernums === null) {
      throw new Error();
    }

    return {
      follower: usernums.follower,
      following: usernums.following,
      postcount: usernums.postcount,
      username: usernums.user.username,
    };
  }

  async addFollow(data: { userTo: string; userFrom: string }) {
    const to = crypter.decrypt(data.userTo);
    const from = crypter.decrypt(data.userFrom);

    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        follower: () => 'follower + 1',
      })
      .where('userId = :id', { id: to })
      .execute();

    await this.db
      .createQueryBuilder()
      .update(Usernums)
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
      .update(Usernums)
      .set({
        follower: () => 'follower - 1',
      })
      .where('userId = :id', { id: to })
      .execute();

    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        following: () => 'following - 1',
      })
      .where('userId = :id', { id: from })
      .execute();

    this.logger.log(`follow removed userTo:${to}, userFrom:${from}`);
  }
}
