import { Injectable } from '@nestjs/common';
import { UserinfoTable } from './repository/userinfo.repository';
import { UserTable } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private userinfoTable: UserinfoTable,
    private userTable: UserTable,
  ) {}
}
