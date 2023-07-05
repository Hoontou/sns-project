import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { SignUpDto } from '../../auth/dto/sign.dto';

@Injectable()
export class UserTable {
  private logger = new Logger('UserTable');
  constructor(
    @InjectRepository(User)
    public readonly db: Repository<User>,
  ) {}

  async signUp(user: SignUpDto): Promise<User> {
    //근데 받아오는 user객체의 비밀번호는 암호화 돼 있어서 정확히는 Dto에 부합하지 않음.
    const newUser: User = this.db.create(user);
    await this.db.save(newUser);

    return newUser;
  }
}
