import { Injectable } from '@nestjs/common';
import { UserTable } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(private userTable: UserTable) {}
}
