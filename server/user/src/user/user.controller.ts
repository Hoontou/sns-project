import { Controller, Logger } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  private logger = new Logger('UserController');
  constructor(private userService: UserService) {}
}
