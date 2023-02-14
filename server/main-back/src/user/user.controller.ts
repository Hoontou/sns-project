import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto, SignInDto } from './dto/user.dto';
//import { User } from './entity/user.entity';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('/hoc')
  @UseGuards(AuthGuard())
  hoc(@Req() req) {
    return req.user; //아직은 그냥 유저정보 보내줌
  }

  //   { 정상적인 bare토큰으로 hoc get리퀘스트 했을시, req.user.
  //     "id": "a6071dbf-3cfb-4b82-8863-92b78903fa91",
  //     "email": "hoontou@gmail.com",
  //     "username": "hoon",
  //     "password": "$2a$10$MKD8AKYYqriumIxQ2NsLK.uDlrb9KdIemTQEXSozJP4PidyWp0WK6",
  //     "createdAt": "2023-02-13T23:51:43.624Z"
  // }

  // { 토큰 틀렸을 시
  //   "statusCode": 401,
  //   "message": "Unauthorized"
  // }

  @Post('/signup')
  signUp(@Body(ValidationPipe) signupDto: SignUpDto) {
    return this.authService.signUp(signupDto);
  }

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) signinDto: SignInDto,
    @Res({ passthrough: true }) res,
    //네스트.com에서는 Response 타입 붙이라고 하는데? 붙이면 쿠키타입이 없다고 나옴. TS버전문제인가
  ): Promise<{ sucess: boolean }> {
    //아니근데 떡하니 async붙여놨는데 리턴타입의 정의를 적어야하나?
    const jwt: { accessToken: string } = await this.authService.signIn(
      signinDto,
    );
    res.cookie('Authorization', jwt.accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, //30 day
    });
    return {
      sucess: true,
    };
  }
}
