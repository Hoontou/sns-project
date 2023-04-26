import { Controller, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  private logger = new Logger('UserController');
  constructor(private userService: UserService) {}

  @GrpcMethod('UserService', 'GetUsernums')
  getUsernums(data: { userId: string }) {
    return this.userService.getUsernums(data);
  }
}
