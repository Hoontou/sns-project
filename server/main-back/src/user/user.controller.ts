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

export interface userInfoResponse {
  success: boolean;
  userUuid?: string;
  username?: string;
  accessToken?: string;
}

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('/')
  hi(@Req() req) {
    console.log(req.cookies);
    console.log('hi');
    return 'hi';
  }
  //----------------------------------------------------------------------------------------------
  //아.. 근데 지금 인증 틀렸을 시 AuthGuard에서 exeption 오류로그를 찍어내는데 마음에 안든다.... 걍 로그 안뜨게 하고싶다.
  @Get('/hoc') //필요한 파라미터는 없고, signin으로부터 클라이언트가 받은 쿠키안에 토큰 필요
  @UseGuards(AuthGuard())
  hoc(@Req() req): userInfoResponse {
    console.log('hi');
    return {
      success: true,
      userUuid: req.user.id,
      username: req.user.username,
    }; //실패시 핸들링을 만들어야 한다. 지금은 실패시 API 오류만 내뱉는다.
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
  // }----------------------------------------------------------------------------------------------

  @Get('/refresh') //JWT 리프레시. 토큰 만료되기 전에 여기로 요청넣어야함.
  @UseGuards(AuthGuard())
  async refresh(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<{ success: boolean }> {
    const refreshedToken = await this.authService.refreshToken(req.user.email);

    res.cookie('Authorization', refreshedToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, //30 day
    });

    return {
      success: true,
    }; //실패시 핸들링을 만들어야 한다. 지금은 실패시 API 오류만 내뱉는다.
  }

  @Post('/signup')
  signUp(
    @Body(ValidationPipe) signupDto: SignUpDto,
  ): Promise<{ success: boolean; msg?: string }> {
    return this.authService.signUp(signupDto);
  }
  //NEED THIS
  //   {
  //     "email": "hoontou@gmail.com",
  //     "password": "test",
  //     "username": "hoon"
  // }----------------------------------------------------------------------------------------------

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) signinDto: SignInDto,
    @Res({ passthrough: true }) res,
    //네스트.com에서는 Response 타입 붙이라고 하는데? 붙이면 쿠키타입이 없다고 나옴. TS버전문제인가
  ): Promise<userInfoResponse> {
    const certInfo: userInfoResponse = await this.authService.signIn(signinDto);
    if (certInfo.success == true) {
      //로그인 플래그 성공이면 쿠키에 담아서 보낸다.
      res.cookie('Authorization', certInfo.accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, //30 day
      });
      delete certInfo.accessToken; //쿠키에 담았으니까 지워준다.
    }
    return certInfo;
  }

  //NEED THIS
  //   {
  //     "email": "hoontou@gmail.com",
  //     "password": "popo8959"
  // }----------------------------------------------------------------------------------------------
}
