import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { Usernums } from '../entity/usernums.entity';
import { UploadMessage } from 'sns-interfaces';

@Injectable()
export class UsernumsTable {
  private logger = new Logger('UsernumsTable');
  constructor(
    @InjectRepository(Usernums)
    public db: Repository<Usernums>,
  ) {}

  async createUserNums(user: User) {
    const newUserNum: Usernums = this.db.create({ user });
    this.db.save(newUserNum);
  }

  /**유저가 게시글 업로드 후 해당유저의 postcount +1 */
  async addPostCount(content: UploadMessage) {
    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        postcount: () => 'postcount + 1',
      })
      .where('userId = :id', { id: content.userId })
      .execute();

    this.logger.log(`userId ${content.userId} postcount added`);
  }

  /**클라이언트의 Userinfo 컴포넌트에서의 요청. */
  getUsernums(
    userId: string,
  ): Promise<{ follower: number; following: number; postcount: number }> {
    return this.db
      .createQueryBuilder()
      .select('follower, following, postcount')
      .where('"userId" = :id', { id: userId })
      .execute();
  }

  async addFollow(data: { userTo: string; userFrom: string }) {
    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        follower: () => 'follower + 1',
      })
      .where('userId = :id', { id: data.userTo })
      .execute();

    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        following: () => 'following + 1',
      })
      .where('userId = :id', { id: data.userFrom })
      .execute();

    this.logger.log(
      `follow added userTo:${data.userTo}, userFrom:${data.userFrom}`,
    );
  }
  async removeFollow(data: { userTo: string; userFrom: string }) {
    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        follower: () => 'follower - 1',
      })
      .where('userId = :id', { id: data.userTo })
      .execute();

    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        following: () => 'following - 1',
      })
      .where('userId = :id', { id: data.userFrom })
      .execute();

    this.logger.log(
      `follow removed userTo:${data.userTo}, userFrom:${data.userFrom}`,
    );
  }
}
