import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  private readonly logger = new Logger('AuthGuard');
  constructor(private userTable: UserTable) {
    super({
      secretOrKey: JwtSecret,
      jwtFromRequest: cookieExtractor,
    });
  }

  async validate(payload): Promise<User> {
    //네스트 제공 AuthGuard()를 쓰면
    //JwtService.verify를 통과하고 여기로 오는듯?
    //통과못하면 unauthException 뱉어냄. 여기로 못옴
    const { email } = payload;
    const user = await this.userTable.db.findOne({
      where: { email }, //이메일이 디비에 있는지 체크인데... 이게 꼭 필요한지는 잘 모르겠다.
    });

    if (!user) {
      throw new NotFoundException();
    }
    this.logger.log(`{ id ${user.id} : ${user.username} } passed Guard`);
    user.id = crypter.encrypt(user.id);
    return user; //이 값이 req.user에 담긴다.
  }
}
