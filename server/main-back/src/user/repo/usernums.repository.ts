import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User, UserNums } from '../entity/user.entity';

@Injectable()
export class UserNumsTable {
  constructor(
    @InjectRepository(UserNums)
    public db: Repository<UserNums>,
  ) {}

  async createUserNums(user: User) {
    const newUserNum: UserNums = this.db.create({ user });
    this.db.save(newUserNum);
  }
}
