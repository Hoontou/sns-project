import { Injectable } from '@nestjs/common';
import { UserService } from './module/user/user.service';
import { FflService } from './module/ffl/ffl.service';

@Injectable()
export class AppService {
  constructor(
    private userService: UserService,
    private fflService: FflService,
  ) {}

  /**usernums + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async getUserInfo(body: { userId: string; myId: string }): Promise<
    | {
        success: true;
        following: number;
        follower: number;
        postcount: number;
        username: string;
        followed: boolean;
      }
    | { success: false }
  > {
    //일단 숫자를 찾는다.
    const usernum = await this.userService.getUsernums(body);

    if (usernum.success === false) {
      //실패했으면 바로 리턴.
      return usernum;
    }
    //성공했으면 계속진행
    // 팔로우 체크할 필요없으면 그냥 펄스넣어서 리턴.
    if (body.myId === '') {
      return { ...usernum, followed: false };
    }
    //팔로우체크후 리턴
    const { followed } = await this.fflService.checkFollowed(body);
    return { ...usernum, followed };
  }
}
