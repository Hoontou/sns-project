import { Controller, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SignInDto } from './dto/sign.dto';
import { Metadata } from '@grpc/grpc-js';
import { AuthResultRes } from 'sns-interfaces';

@Controller('user')
export class UserController {
  private logger = new Logger('UserController');

  @GrpcMethod('UserService', 'SignIn')
  signIn(signInReq: SignInDto, metadata: Metadata): AuthResultRes {
    console.log(signInReq);
    console.log(metadata, 1);
    return { success: false };
  }
}
