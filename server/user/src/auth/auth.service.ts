import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, SignInDto } from './dto/sign.dto';
import { User } from 'src/user/entity/user.entity';
import { crypter } from '../common/crypter';
import { AuthDto, AuthResultRes, AuthSuccess } from 'sns-interfaces';
import { JwtStrategy } from './jwt-strategy';
import { UserRepository } from 'src/user/user.repo';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userRepo: UserRepository,
    private jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
  ) {}

  async auth(authDto: AuthDto): Promise<AuthResultRes> {
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
    } catch {
      this.logger.error('Auth failed');
      return { success: false };
    }
  }

  async signIn(signinDto: SignInDto): Promise<AuthResultRes> {
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

  async signUp(
    signupDto: SignUpDto,
  ): Promise<{ success: boolean; msg?: string; username?: string }> {
    //1 username 중복체크
    const existTest = await Promise.all([
      this.userRepo.userinfoTable.db.findOneBy({
        username: signupDto.username,
      }),
      this.userRepo.userTable.db.findOneBy({ email: signupDto.email }),
    ]);

    //some 메서드는 true를 찾으면 중지하고 true 반환
    if (existTest.some((i) => i !== null)) {
      return { success: false, msg: 'Existing username or eamil' };
    }
    //2 통과하면 테이블에 삽입
    //유저테이블, 유저인포테이블에 수동넣고 트리거로 유저넘
    //트라이로 해서 리턴 success true

    const user = signupDto;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    //삽입요청
    try {
      await this.userRepo.signUp(user);
      return { success: true, username: signupDto.username };
    } catch (error) {
      return { success: false, msg: 'DB insert err' };
    }
  }
}
