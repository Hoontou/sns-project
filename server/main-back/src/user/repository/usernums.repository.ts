import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { Usernums } from '../entity/usernums.entity';

@Injectable()
export class UsernumsTable {
  constructor(
    @InjectRepository(Usernums)
    public db: Repository<Usernums>,
  ) {}

  async createUserNums(user: User) {
    const newUserNum: Usernums = this.db.create({ user });
    this.db.save(newUserNum);
  }

  //from postRepository
  async addPost(userId: string | number) {
    await this.db
      .createQueryBuilder()
      .update(Usernums)
      .set({
        postcount: () => 'postcount + 1',
      })
      .where('userId = :id', { id: userId })
      .execute();
  }
}
