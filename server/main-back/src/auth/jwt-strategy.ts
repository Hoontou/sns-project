import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { User } from 'src/user/entity/user.entity';
import { UserTable } from '../user/repository/user.repository';
import { JwtSecret, crypter } from '../common/crypter';

//쿠키로 바로 토큰가져오게
const cookieExtractor = (req): string => {
  return req.cookies['Authorization'] || 'foo';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userTable: UserTable) {
    super({
      secretOrKey: JwtSecret,
      jwtFromRequest: cookieExtractor,
    });
  }

  async validate(payload): Promise<User> {
    const { email } = payload;
    const user = await this.userTable.db.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    user.id = crypter.encrypt(user.id);
    return user;
  }
}
