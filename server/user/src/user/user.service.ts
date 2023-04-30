import { Injectable } from '@nestjs/common';
import { UsernumsTable } from './repository/usernums.repository';
import { UserTable } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private usernumsTable: UsernumsTable,
    private userTable: UserTable,
  ) {}
  async getUsernums(data: { userId: string }) {
    const res = await this.usernumsTable.getUsernumsFromUserId(data.userId);
    return res;
    //아 이거 select해서 배열로 받아오는거 기분나쁜데...
  }
}
