import { Inject, Injectable, Req, Res } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthResultRes, SignInDto, SignUpDto } from 'sns-interfaces';
import { checkNeedRefresh } from 'src/common/checkneedrefresh';
import { AuthGrpcService } from 'src/grpc/grpc.services';

@Injectable()
export class AuthService {
  private authGrpcService: AuthGrpcService;
  private month = 30 * 24 * 60 * 60 * 1000;

  constructor(@Inject('auth') private client: ClientGrpc) {}
  onModuleInit() {
    this.authGrpcService =
      this.client.getService<AuthGrpcService>('AuthService');
  }

  async auth(@Req() req, @Res() res): Promise<AuthResultRes> {
    const accessToken: string | undefined = req.cookies['Authorization'];
    const createdAt: string | undefined = req.cookies['createdAt'];
    //위 둘중 하나라도 없으면 튕긴다.
    if (accessToken === undefined || createdAt === undefined) {
      return { success: false };
    }

    const authInfo: AuthResultRes = await lastValueFrom(
      this.authGrpcService.auth({
        accessToken,
        refresh: checkNeedRefresh(createdAt), //Need refresh?
      }),
    );
    //리프레시 토큰이 담겨왔으면 쿠키 다시세팅
    if (authInfo.success === true && authInfo.accessToken !== undefined) {
      res.cookie('Authorization', authInfo.accessToken, {
        httpOnly: true,
        maxAge: this.month,
      });
      res.cookie('createdAt', new Date(), {
        httpOnly: true,
        maxAge: this.month,
      });
      delete authInfo.accessToken; //쿠키에 담았으니까 리턴값에서는 지워준다.
    }
    return authInfo;
  }

  //미들웨어를 위한 메서드임. 리프레시 기능 삭제
  async authMiddleware(@Req() req): Promise<AuthResultRes> {
    const accessToken: string | undefined = req.cookies['Authorization'];
    if (accessToken === undefined) {
      return { success: false };
    }
    const authInfo: AuthResultRes = await lastValueFrom(
      this.authGrpcService.auth({
        accessToken,
        refresh: false,
      }),
    );
    return authInfo;
  }

  async signIn(
    signInDto: SignInDto,
    @Res() res,
  ): Promise<
    | {
        success: true;
        userId: string;
        accessToken?: string;
      }
    | { success: false }
  > {
    const authInfo: AuthResultRes = await lastValueFrom(
      this.authGrpcService.signIn(signInDto),
    );

    if (authInfo.success === true) {
      // const maxAgeInSeconds = 30 * 24 * 60 * 60; // 30일을 초 단위로 계산
      // const maxAgeInMilliseconds = maxAgeInSeconds * 1000; // 밀리초로 변환
      //로그인 플래그 성공이면 쿠키에 담아서 보낸다.
      res.cookie('Authorization', authInfo.accessToken, {
        httpOnly: true,
        maxAge: this.month,
      });
      res.cookie('createdAt', new Date(), {
        httpOnly: true,
        maxAge: this.month,
      });
      delete authInfo.accessToken; //쿠키에 담았으니까 지워준다.
    }
    return authInfo;
  }

  signUp(signUpDto: SignUpDto): Promise<{
    success: boolean;
    msg?: string | undefined;
  }> {
    return lastValueFrom(this.authGrpcService.signUp(signUpDto));
  }
}
