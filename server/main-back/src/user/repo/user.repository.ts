import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entity/user.entity';
import { SignUpDto } from '../dto/user.dto';
import { UserNumsTable } from './usernums.repository';

@Injectable()
export class UserTable {
  constructor(
    @InjectRepository(User)
    public db: Repository<User>,
    private userNumsTable: UserNumsTable,
  ) {}
  async signUp(user: SignUpDto): Promise<User> {
    //근데 받아오는 user객체의 비밀번호는 암호화 돼 있어서 정확히는 Dto에 부합하지 않음.
    const newUser: User = this.db.create(user);
    let success = true;
    try {
      await this.db.save(newUser);
      //콘솔테스트
      // const result = await this.db.save(user);
      // console.log(result);
    } catch (error) {
      success = false;
      console.log(error.code);
      if (error.code === '23505') {
        throw new ConflictException('Existing username or eamil');
      }
      throw new InternalServerErrorException();
    } finally {
      //유저생성 성공했으면 usernums테이블에 insert한다.
      if (success == true) {
        this.userNumsTable.createUserNums(newUser);
      }
    }
    return newUser;
  }
}
