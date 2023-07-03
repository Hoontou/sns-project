import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, SignInDto } from './dto/sign.dto';
import { User } from 'src/user/entity/user.entity';
import { UserTable } from '../user/repository/user.repository';
import { crypter } from '../common/crypter';
import { AuthDto, AuthResultRes, AuthSuccess } from 'sns-interfaces';
import { JwtStrategy } from './jwt-strategy';
import { UserinfoTable } from '../user/repository/userinfo.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userTable: UserTable,
    private userinfoTable: UserinfoTable,
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
      this.logger.error('Authorization failed');
      return { success: false };
    }
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

  async signUp(signupDto: SignUpDto) {
    const user = signupDto;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    try {
      //userinfo삽입을 트리거로 대체해서 newUser를 가져올 필요가 없다.
      //트리거 안쓰면 활성화 할 코드들임.
      // const newUser = await this.userTable.signUp(signupDto);
      //  await this.userinfoTable.createUserNums(newUser);
      await this.userTable.signUp(signupDto);
    } catch (error) {
      //아래의 23505코드는 postgres의 unique 충돌 코드임.
      if (error.code === '23505') {
        return { success: false, msg: 'Existing username or eamil' };
      }
      return { success: false, msg: 'DB insert err' };
    }
    return { success: true };
  }
}
