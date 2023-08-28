import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { JwtSecret, crypter } from '../common/crypter';
import { AuthSuccess } from 'sns-interfaces';
import { UserRepository } from 'src/user/user.repo';

const tokenExtractor = (req): string => {
  return req.accessToken;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('AuthGuard');
  // constructor(private userTable: UserTable) {
  constructor(private userRepo: UserRepository) {
    super({
      secretOrKey: JwtSecret,
      jwtFromRequest: tokenExtractor,
    });
  }
  async validate(email): Promise<AuthSuccess> {
    //네스트 제공 AuthGuard()를 쓰면
    //JwtService.verify를 통과하고 여기로 오는듯?
    //통과못하면 unauthException 뱉어냄. 여기로 못옴
    const user = await this.userRepo.userTable.db.findOne({
      where: { email }, //이메일이 디비에 있는지 체크인데... 이게 꼭 필요한지는 잘 모르겠다.
    });
    if (!user) {
      throw new NotFoundException();
    }

    const userinfo = await this.userRepo.getUsernameWithImg(String(user.id));
    if (userinfo === undefined) {
      throw new NotFoundException();
    }

    this.logger.log(`{ id ${user.id} } passed Guard`);
    return {
      userId: crypter.encrypt(user.id),
      username: userinfo.username,
      success: true,
    }; //이 값이 req.user에 담긴다.
  }
}
