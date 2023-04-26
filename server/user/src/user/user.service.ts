import { Injectable } from '@nestjs/common';
import { UsernumsTable } from './repository/usernums.repository';

@Injectable()
export class UserService {
  constructor(private usernumsTable: UsernumsTable) {}
  async getUsernums(data: { userId: string }) {
    const res = await this.usernumsTable.getUsernums(data.userId);
    return res[0];
    //아 이거 select해서 배열로 받아오는거 기분나쁜데...
  }
}
