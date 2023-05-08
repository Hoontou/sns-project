import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { SignUpDto } from '../../auth/dto/sign.dto';
import { UserinfoTable } from './userinfo.repository';
import { crypter } from 'src/common/crypter';

@Injectable()
export class UserTable {
  private logger = new Logger('UserTable');
  constructor(
    @InjectRepository(User)
    public db: Repository<User>,
    private userNumsTable: UserinfoTable,
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
    }
    //유저생성 성공했으면 userinfo테이블에 insert한다.
    if (success == true) {
      this.userNumsTable.createUserNums(newUser);
    }
    return { success: true };
  }

  async changeUsername(data: {
    userId: string;
    username: string;
  }): Promise<{ success: boolean; exist?: boolean }> {
    try {
      const checkedUser = await this.db.findOneBy({ username: data.username });
      //username이 이미 쓰고있으면
      if (checkedUser !== null) {
        return { success: false, exist: true };
      }

      //userId로 유저 찾아서
      const user = await this.db.findOneBy({
        id: Number(crypter.decrypt(data.userId)),
      });
      if (!user) {
        return { success: false }; // user가 없는 경우,
      }
      //username바꾸고 저장
      user.username = data.username;
      await this.db.save(user);

      //성공 리턴
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }
}
