import { Injectable, Req, Res } from '@nestjs/common';
import { UserTable } from './repository/user.repository';
import { AuthService } from 'src/auth/auth.service';
import { SignInDto } from './dto/sign.dto';
import { UserInfoResponse } from './user.controller';

@Injectable()
export class UserService {
  constructor(private userTable: UserTable, private authService: AuthService) {}

  //----------------------------------------------------------------------------------------------
  //아.. 근데 지금 인증 틀렸을 시 AuthGuard에서 exeption 오류로그를 찍어내는데 마음에 안든다.... 걍 로그 안뜨게 하고싶다.
  //밑에 인증 리프레시랑 기능을 좀 합쳤다. 이렇게되면 매번 시간계산을 해야하는데
  //이게 자원을 좀 잡아먹을것 같긴한데... 새로운 객체를 두개나 생성하고, 계산까지.
  //그냥 리프레시를 써야하나?
  async hoc(@Req() req, @Res() res): Promise<UserInfoResponse> {
    const createdAt = new Date(req.cookies.createdAt);
    const now = new Date();
    //쿠키생성 하루가 지났으면 새로 JWT발급받고 생성시간 업데이트해서 날린다.
    if ((now.getTime() - createdAt.getTime()) / 1000 / 60 / 60 > 24) {
      //경과시간. 위에는 하루가 지났으면?
      //(now.getTime() - createdAt.getTime()) / 1000 / 60 분단위, 몇분지났나?
      //(now.getTime() - createdAt.getTime()) / 1000 / 60 / 60 시간단위
      const refreshedToken = await this.authService.refreshToken(
        req.user.email,
      );

      res.cookie('Authorization', refreshedToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, //30 day
      });
      res.cookie('createdAt', now, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, //30 day
      });
    }
    //위 코드만 싹다없애면 원래의 hoc임.

    return {
      success: true,
      userId: req.user.id,
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

  async signin(signinDto: SignInDto, res): Promise<UserInfoResponse> {
    const certInfo: UserInfoResponse = await this.authService.authenticate(
      signinDto,
    );
    if (certInfo.success == true) {
      const createdAt = new Date();
      //로그인 플래그 성공이면 쿠키에 담아서 보낸다.
      res.cookie('Authorization', certInfo.accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, //30 day
      });
      res.cookie('createdAt', createdAt, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, //30 day
      });
      delete certInfo.accessToken; //쿠키에 담았으니까 지워준다.
    }
    return certInfo; //{ success, userId?, username? }
  }
}
