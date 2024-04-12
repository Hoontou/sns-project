import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entity/user.entity';

@Injectable()
export class UserTable {
  private logger = new Logger('UserTable');
  constructor(
    @InjectRepository(User)
    public readonly db: Repository<User>,
  ) {}
}
