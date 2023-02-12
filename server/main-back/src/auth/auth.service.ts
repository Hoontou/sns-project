import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, SignInDto } from '../user/dto/user.dto';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signupDto: SignUpDto): Promise<User> {
    const user = signupDto;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    return this.userRepository.signUp(user);
  }

  async signIn(signinDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signinDto;
    const user = await this.userRepository.db.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      //로그인 성공한 상태이고 이제 JWT를 생성해야함. Secret + Patload(페이로드는 중요정보 넣지마라.)
      const payload = { email };
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken }; //토큰을 바로넘기지 말고 이렇게 객체로 넘긴다.
    } else {
      throw new UnauthorizedException('login failed');
    }
  }
}
