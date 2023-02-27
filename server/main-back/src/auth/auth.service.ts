import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, SignInDto } from '../user/dto/user.dto';
import { User } from 'src/user/entity/user.entity';
import { UserTable } from '../user/repo/user.repository';
import { userInfoResponse } from '../user/user.controller';
import { crypter } from '../common/crypter';

@Injectable()
export class AuthService {
  constructor(private userTable: UserTable, private jwtService: JwtService) {}

  async signUp(signupDto: SignUpDto) {
    const user = signupDto;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    return this.userTable.signUp(user);
  }

  async signIn(signinDto: SignInDto): Promise<userInfoResponse> {
    const { email, password } = signinDto;
    const user: User | null = await this.userTable.db.findOne({
      where: { email },
    });
    //성공시
    if (user && (await bcrypt.compare(password, user.password))) {
      //로그인 성공한 상태이고 이제 JWT를 생성해야함. Secret + Patload(페이로드는 중요정보 넣지마라.)
      const payload = { email };
      const accessToken = await this.jwtService.sign(payload);
      const test = crypter.encrypt(user.id);
      console.log(test);
      console.log(crypter.decrypt(test));
      return {
        accessToken,
        userUuid: crypter.encrypt(user.id),
        username: user.username,
        success: true,
      }; //토큰을 바로넘기지 말고 이렇게 객체로 넘긴다.
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
