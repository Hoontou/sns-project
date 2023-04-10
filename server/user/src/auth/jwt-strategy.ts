import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserTable } from '../user/repository/user.repository';
import { JwtSecret, crypter } from '../common/crypter';
import { AuthSuccess } from 'sns-interfaces';

//쿠키로 바로 토큰가져오게, 이젠 grpc로 대체했음.
// const cookieExtractor = (req): string => {
//   return req.cookies['Authorization'] || 'foo';
// };
//이거 @UseGuard(AuthGuard())에 쓰이는건데 grpc전환하고 이제 안씀
const tokenExtractor = (req): string => {
  return req.accessToken;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('AuthGuard');
  constructor(private userTable: UserTable) {
    super({
      secretOrKey: JwtSecret,
      jwtFromRequest: tokenExtractor,
    });
  }

  async validate(email): Promise<AuthSuccess> {
    //네스트 제공 AuthGuard()를 쓰면
    //JwtService.verify를 통과하고 여기로 오는듯?
    //통과못하면 unauthException 뱉어냄. 여기로 못옴
    const user = await this.userTable.db.findOne({
      where: { email }, //이메일이 디비에 있는지 체크인데... 이게 꼭 필요한지는 잘 모르겠다.
    });

    if (!user) {
      throw new NotFoundException();
    }
    this.logger.log(`{ id ${user.id} : ${user.username} } passed Guard`);
    user.id = crypter.encrypt(user.id);
    return { userId: user.id, username: user.username, success: true }; //이 값이 req.user에 담긴다.
  }
}
