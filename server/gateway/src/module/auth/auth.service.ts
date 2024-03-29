import { Injectable, Logger, Req, Res } from '@nestjs/common';
import {
  AuthDto,
  AuthResultRes,
  AuthSuccess,
  SignInDto,
  SignUpDto,
} from 'sns-interfaces';
import { checkNeedRefresh } from 'src/common/checkneedrefresh';
import { UserRepository } from '../user/user.repo';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt-strategy';
import { User } from '../user/entity/user.entity';
import * as bcrypt from 'bcryptjs';
import { crypter } from '../../common/crypter';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private month = 30 * 24 * 60 * 60 * 1000;

  constructor(
    private userRepo: UserRepository,
    private jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
  ) {}

  async auth(@Req() req, @Res() res): Promise<AuthResultRes> {
    console.log(req);
    const accessToken: string | undefined = req.cookies['Authorization'];
    const createdAt: string | undefined = req.cookies['createdAt'];
    //위 둘중 하나라도 없으면 튕긴다.
    if (accessToken === undefined || createdAt === undefined) {
      return { success: false };
    }

    const authInfo: AuthResultRes = await this.jwtCheck({
      accessToken,
      refresh: checkNeedRefresh(createdAt), //Need refresh?
    });

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
    const authInfo: AuthResultRes = await this.jwtCheck({
      accessToken,
      refresh: false,
    });
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
    const authInfo = await this.generateToken(signInDto);

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

  async signUp(signUpDto: SignUpDto): Promise<{
    success: boolean;
    msg?: string | undefined;
  }> {
    //1 username 중복체크
    const existTest = await Promise.all([
      this.userRepo.userinfoTable.db.findOneBy({
        username: signUpDto.username,
      }),
      this.userRepo.userTable.db.findOneBy({ email: signUpDto.email }),
    ]);

    //some 메서드는 true를 찾으면 중지하고 true 반환
    if (existTest.some((i) => i !== null)) {
      return { success: false, msg: 'Existing username or eamil' };
    }
    //2 통과하면 테이블에 삽입
    //유저테이블, 유저인포테이블에 수동넣고 트리거로 유저넘
    //트라이로 해서 리턴 success true

    const user = signUpDto;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    //삽입요청
    try {
      await this.userRepo.signUp(user);
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, msg: 'DB insert err' };
    }
  }

  async jwtCheck(authDto: AuthDto): Promise<AuthResultRes> {
    try {
      //토큰검사 후 이메일 가져옴
      const authInfo: { email: string; iat: string; exp: string } =
        await this.jwtService.verify(authDto.accessToken);

      //가져온 이메일로 유저정보 요청
      const user: AuthSuccess = await this.jwtStrategy.validate(authInfo.email);

      //refresh필요하다면? 토큰재발급해서 담아준다.
      if (authDto.refresh === true) {
        this.logger.log('regenerate accessToekn');
        user.accessToken = await this.jwtService.sign({
          email: authInfo.email,
        });
      }

      return user;
    } catch (err) {
      console.log(err);
      this.logger.error('Auth failed');
      return { success: false };
    }
  }

  async generateToken(signinDto: SignInDto): Promise<
    | {
        success: true;
        userId: string;
        accessToken?: string;
      }
    | { success: false }
  > {
    const { email, password } = signinDto;

    const user: User | null = await this.userRepo.userTable.db.findOne({
      where: { email },
    });
    //성공시
    if (user && (await bcrypt.compare(password, user.password))) {
      //로그인 성공한 상태이고 이제 JWT를 생성해야함. Secret + Patload(페이로드는 중요정보 넣지마라.)
      const accessToken = await this.jwtService.sign({ email });
      this.logger.log(`{id: ${user.id} Login`);
      return {
        accessToken,
        userId: crypter.encrypt(user.id),
        success: true,
      };
    }
    //실패시
    return { success: false };
  }
}
