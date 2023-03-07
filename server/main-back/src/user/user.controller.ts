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
import { SignUpDto, SignInDto } from './dto/sign.dto';
//import { User } from './entity/user.entity';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';

export interface UserInfoResponse {
  success: boolean;
  userId?: string;
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
  hi() {
    console.log('hi');
    return 'hi';
  }

  @Get('/hoc') //필요한 파라미터는 없고, signin으로부터 클라이언트가 받은 쿠키안에 토큰 필요
  @UseGuards(AuthGuard())
  async hoc(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<UserInfoResponse> {
    return this.userService.hoc(req, res);
  } //서비스 코드에 주석 많이달아놨음.

  //토큰 리프레시를 hoc랑 합쳐놨음. 지금은 사용안하는 코드.
  // @Get('/refresh') //JWT 리프레시. 토큰 만료되기 전에 여기로 요청넣어야함.
  // @UseGuards(AuthGuard())
  // async refresh(
  //   @Req() req,
  //   @Res({ passthrough: true }) res,
  // ): Promise<{ success: boolean }> {
  //   const refreshedToken = await this.authService.refreshToken(req.user.email);

  //   res.cookie('Authorization', refreshedToken, {
  //     httpOnly: true,
  //     maxAge: 60 * 60 * 24 * 30, //30 day
  //   });

  //   return {
  //     success: true,
  //   }; //실패시 핸들링을 만들어야 한다. 지금은 실패시 API 오류만 내뱉는다.
  // }

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
  ): Promise<UserInfoResponse> {
    return this.userService.signin(signinDto, res);
  }

  //NEED THIS
  //   {
  //     "email": "hoontou@gmail.com",
  //     "password": "test"
  // }----------------------------------------------------------------------------------------------
}
