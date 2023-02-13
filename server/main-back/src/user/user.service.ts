import { Injectable } from '@nestjs/common';
import { UserTable } from './repo/user.repository';

@Injectable()
export class UserService {
  constructor(private userTable: UserTable) {}
}
