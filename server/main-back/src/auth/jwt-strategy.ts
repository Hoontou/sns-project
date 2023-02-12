import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/entity/user.entity';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userRepository: UserRepository) {
    super({
      secretOrKey: 'auth',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload): Promise<User> {
    const { email } = payload;
    const user = await this.userRepository.db.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
