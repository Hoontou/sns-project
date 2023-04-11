import { Inject, Injectable, OnModuleInit, Req, Res } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthResultRes, SignInDto, SignUpDto } from 'sns-interfaces';
import { checkNeedRefresh } from 'src/common/checkneedrefresh';
import { AuthGrpcService } from 'src/grpc/grpc.interfaces';

@Injectable()
export class AuthService implements OnModuleInit {
  private userGrpcService: AuthGrpcService;
  constructor(@Inject('auth') private client: ClientGrpc) {}
  onModuleInit() {
    this.userGrpcService =
      this.client.getService<AuthGrpcService>('AuthService');
  }

  async auth(@Req() req, @Res() res): Promise<AuthResultRes> {
    const accessToken: string = req.cookies['Authorization'] || 'foo';
    if (accessToken === 'foo') {
      return { success: false };
    }
    const authInfo = await lastValueFrom(
      this.userGrpcService.auth({
        accessToken,
        refresh: checkNeedRefresh(req.cookies.createdAt),
      }),
    );
    //리프레시 토큰이 담겨왔으면 쿠키 다시세팅
    if (authInfo.success === true && authInfo.accessToken) {
      res.cookie('Authorization', authInfo.accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, //30 day
      });
      res.cookie('createdAt', new Date(), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, //30 day
      });
      delete authInfo.accessToken; //쿠키에 담았으니까 지워준다.
    }
    return authInfo;
  }
  //미들웨어를 위한 메서드임. 리프레시 기능 삭제
  async authMiddleware(@Req() req): Promise<AuthResultRes> {
    const accessToken: string = req.cookies['Authorization'] || 'foo';
    if (accessToken === 'foo') {
      return { success: false };
    }
    const authInfo = await lastValueFrom(
      this.userGrpcService.auth({
        accessToken,
        refresh: false,
      }),
    );
    return authInfo;
  }

  async signIn(signInDto: SignInDto, @Res() res): Promise<AuthResultRes> {
    const authInfo = await lastValueFrom(
      this.userGrpcService.signIn(signInDto),
    );

    if (authInfo.success === true) {
      //로그인 플래그 성공이면 쿠키에 담아서 보낸다.
      res.cookie('Authorization', authInfo.accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, //30 day
      });
      res.cookie('createdAt', new Date(), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, //30 day
      });
      delete authInfo.accessToken; //쿠키에 담았으니까 지워준다.
      return authInfo;
    }
    return authInfo;
  }

  async signUp(signUpDto: SignUpDto) {
    return lastValueFrom(this.userGrpcService.signUp(signUpDto));
  }
}
