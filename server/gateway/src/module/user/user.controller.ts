import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthResultRes, SignInDto } from 'sns-interfaces';
import { UserService } from './user.service';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { userMicroserviceOptions } from 'src/grpc/grpc.options';
import { UserGrpcService } from 'src/grpc/grpc.interfaces';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('/signin')
  signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res,
    //네스트.com에서는 Response 타입 붙이라고 하는데? 붙이면 쿠키타입이 없다고 나옴. TS버전문제인가
  ) {
    return this.userService.signIn(signInDto);
  }
}
