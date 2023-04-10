import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, SignInDto } from '../user/dto/sign.dto';
import { User } from 'src/user/entity/user.entity';
import { UserTable } from '../user/repository/user.repository';
import { crypter } from '../common/crypter';
import { AuthDto, AuthResultRes } from 'sns-interfaces';
import { JwtStrategy } from './jwt-strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userTable: UserTable,
    private jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
  ) {}

  async auth(authDto: AuthDto): Promise<AuthResultRes> {
    try {
      //토큰검사 후 이메일 가져옴
      const authInfo: { email: string; iat: string; exp: string } =
        await this.jwtService.verify(authDto.accessToken);
      //가져온 이메일로 유저정보 요청
      const user = await this.jwtStrategy.validate(authInfo.email);

      //refresh필요하다면? 토큰재발급해서 담아준다.
      if (authDto.refresh === true) {
        this.logger.log('regenerate accessToekn');
        user.accessToken = await this.jwtService.sign({
          email: authInfo.email,
        });
      }

      return user;
    } catch {
      this.logger.log('Authorization failed');
      return { success: false };
    }
  }

  async signUp(signupDto: SignUpDto) {
    const user = signupDto;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    return this.userTable.signUp(user);
  }

  async signIn(signinDto: SignInDto): Promise<AuthResultRes> {
    const { email, password } = signinDto;
    const user: User | null = await this.userTable.db.findOne({
      where: { email },
    });
    //성공시
    if (user && (await bcrypt.compare(password, user.password))) {
      //로그인 성공한 상태이고 이제 JWT를 생성해야함. Secret + Patload(페이로드는 중요정보 넣지마라.)
      const payload = { email };
      const accessToken = await this.jwtService.sign(payload);
      this.logger.log(`{id: ${user.id}, ${user.username}} Login`);
      this.logger.log(`generate accessToken`);
      return {
        accessToken,
        userId: crypter.encrypt(user.id),
        username: user.username,
        success: true,
      };
    }
    //실패시
    return { success: false };
  }

  async refreshToken(email: string): Promise<string> {
    const payload = { email };
    const accessToken: string = await this.jwtService.sign(payload);
    return accessToken;
  }
}
