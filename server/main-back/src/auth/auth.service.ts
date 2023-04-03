import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, SignInDto } from '../user/dto/sign.dto';
import { User } from 'src/user/entity/user.entity';
import { UserTable } from '../user/repository/user.repository';
import { crypter } from '../common/crypter';
import { CertResult } from 'src/common/interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private userTable: UserTable, private jwtService: JwtService) {}

  async signUp(signupDto: SignUpDto) {
    const user = signupDto;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    return this.userTable.signUp(user);
  }

  async authenticate(signinDto: SignInDto): Promise<CertResult> {
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
      return {
        accessToken,
        userId: crypter.encrypt(user.id),
        username: user.username,
        success: true,
      }; //CertSuccess
    }
    //실패시
    return { success: false }; //CertFail
  }

  async refreshToken(email: string): Promise<string> {
    const payload = { email };
    const accessToken: string = await this.jwtService.sign(payload);
    return accessToken;
  }
}
