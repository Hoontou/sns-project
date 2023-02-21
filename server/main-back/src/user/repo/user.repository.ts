import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
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
  async signUp(user: SignUpDto): Promise<{ success: boolean; msg?: string }> {
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
      //console.log(error.code);
      //아래의 23505코드는 postgres의 unique 충돌 코드임.
      if (error.code === '23505') {
        return { success, msg: 'Existing username or eamil' };
      }
      return { success, msg: 'DB insert err' };
    } finally {
      //유저생성 성공했으면 usernums테이블에 insert한다.
      if (success == true) {
        this.userNumsTable.createUserNums(newUser);
      }
    }
    return { success: true };
  }
}
