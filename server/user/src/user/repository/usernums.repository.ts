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

  //from postRepository
  async addPostCount(content: UploadMessage) {
    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        postcount: () => 'postcount + 1',
      })
      .where('userId = :id', { id: content.userId })
      .execute();
  }

  getUsernums(userId: string) {
    return this.db
      .createQueryBuilder()
      .select('follower, following, postcount')
      .where('"userId" = :id', { id: userId })
      .execute();
  }
}
