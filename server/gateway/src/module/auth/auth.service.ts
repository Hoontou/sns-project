import {
  Injectable,
  Logger,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common';
import {
  AuthResultRes,
  AuthSuccess,
  SignInDto,
  SignUpDto,
} from 'sns-interfaces';
import { UserRepository } from '../user/user.repo';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import * as bcrypt from 'bcryptjs';
import { crypter } from '../../common/crypter';
import { StateManager } from './manager/state.manager';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private week = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private userRepo: UserRepository,
    private jwtService: JwtService,
    private stateManager: StateManager,
  ) {}

  async auth(@Req() req, @Res() res): Promise<AuthResultRes> {
    const accessToken: string | undefined = req.cookies['Authorization'];
    const originCode: string | undefined = req.cookies['originCode'];

    //위 둘중 하나라도 없으면 튕긴다.
    if (!accessToken || !originCode) {
      return { success: false };
    }

    try {
      //토큰검사 후 이메일 가져옴
      const jwtResult: {
        userId: number;
        email: string;
        iat: string;
        exp: string;
      } = await this.jwtService.verify(accessToken);

      if (this.stateManager.getState(jwtResult.userId) !== originCode) {
        throw new Error('1');
      }

      //가져온 이메일로 유저정보 요청
      const { userId, username } = await this.checkUserExist(jwtResult.email);

      const authInfo: AuthSuccess = {
        userId,
        username,
        success: true,
      };

      if (checkNeedRefresh(Number(jwtResult.iat))) {
        const token = await this.jwtService.sign({
          email: jwtResult.email,
        });

        authInfo.accessToken = token;
        res.cookie('Authorization', token, {
          httpOnly: false,
          maxAge: this.week,
        });
        res.cookie('originCode', originCode, {
          httpOnly: false,
          maxAge: this.week,
        });
      }

      return authInfo;
    } catch (err) {
      res.clearCookie('Authorization');
      res.clearCookie('originCode');

      if (err.message === '1') {
        return {
          success: false,
          msg: '로그인 정보가 바뀌었어요. 다시 로그인 해주세요.',
        };
      }
      return { success: false, msg: '인증에 실패했어요.' };
    }
  }
  async authForMiddleware(
    @Req() req,
    @Res() res,
  ): Promise<
    { success: true; userId: number } | { success: false; msg?: string }
  > {
    const accessToken: string | undefined = req.cookies['Authorization'];
    const originCode: string | undefined = req.cookies['originCode'];

    //위 둘중 하나라도 없으면 튕긴다.
    if (!accessToken || !originCode) {
      return { success: false };
    }

    try {
      //토큰검사 후 이메일 가져옴
      const jwtResult = await this.jwtService.verify(accessToken);

      if (this.stateManager.getState(jwtResult.userId) !== originCode) {
        throw new Error('1');
      }

      return { userId: jwtResult.userId, success: true };
    } catch (err) {
      res.clearCookie('Authorization');
      res.clearCookie('originCode');

      if (err.message === '1') {
        return {
          success: false,
          msg: '로그인 정보가 바뀌었어요. 다시 로그인 해주세요.',
        };
      }
      return { success: false, msg: '인증에 실패했어요.' };
    }
  }

  async signIn(
    signInDto: SignInDto,
    @Res() res,
  ): Promise<
    | {
        success: true;
      }
    | { success: false; msg: string }
  > {
    const result = await this.checkPasswordAndgenToken(signInDto);

    if (result.success === false) {
      return result;
    }

    const userOriginCode = new Types.ObjectId().toString();
    this.stateManager.setState(result.userId, userOriginCode);

    res.cookie('Authorization', result.accessToken, {
      httpOnly: false,
      maxAge: this.week,
    });
    res.cookie('originCode', userOriginCode, {
      httpOnly: false,
      maxAge: this.week,
    });

    return { success: true };
  }

  async signUp(signUpDto: SignUpDto): Promise<{
    success: boolean;
    msg?: string | undefined;
  }> {
    const lowerUsername = signUpDto.username.toLocaleLowerCase();
    //1 username 중복체크
    const existTest = await Promise.all([
      this.userRepo.userinfoTable.db.findOneBy({
        username: lowerUsername,
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

    const user: SignUpDto = { ...signUpDto, username: lowerUsername };
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    //삽입요청
    try {
      await this.userRepo.signUp(user);
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return { success: false, msg: 'DB insert err' };
    }
  }

  async checkPasswordAndgenToken(signinDto: SignInDto): Promise<
    | {
        success: true;
        accessToken?: string;
        userId: number;
      }
    | { success: false; msg: string }
  > {
    const { email, password } = signinDto;

    const user: User | null = await this.userRepo.userTable.db.findOne({
      where: { email },
    });

    if (user === null) {
      return { success: false, msg: 'account not exist' };
    }

    if (await bcrypt.compare(password, user.password)) {
      //로그인 성공한 상태이고 이제 JWT를 생성해야함. Secret + Patload(페이로드는 중요정보 넣지마라.)
      const accessToken = await this.jwtService.sign({
        email,
        userId: user.id,
      });
      // this.logger.debug(`{id: ${user.id} Login`);
      return {
        accessToken,
        success: true,
        userId: user.id,
      };
    }
    return { success: false, msg: 'passowrd incorrected' };
  }

  async checkUserExist(email): Promise<{ userId: string; username: string }> {
    const result = await this.userRepo.getUserIdWithUsernameByEmail(email);
    if (result === undefined) {
      throw new NotFoundException('user not found');
    }

    return {
      userId: crypter.encrypt(result.id),
      username: result.username,
    };
  }
}

const checkNeedRefresh = (unixTime: number): boolean => {
  //쿠키생성 하루 * 6가 지났으면 새로 JWT발급받고 생성시간 업데이트해서 날린다.
  const dayDifference = Math.floor(
    (new Date().getTime() - new Date(unixTime * 1000).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return dayDifference > 6 ? true : false;
};
