import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthSuccess } from 'sns-interfaces';
import { AuthService } from './auth.service';

interface Req extends Request {
  user: AuthSuccess;
}

//인가를 위한 미들웨어. 전역에 설치할거임
//https://docs.nestjs.com/middleware
//app.module.ts에 전역으로 설치했음. usercontroller 제외
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private logger = new Logger(AuthMiddleware.name);
  constructor(private authService: AuthService) {}

  async use(req: Req, res: Response, next: NextFunction) {
    const authResult = await this.authService.auth(req, res);
    //아래 코드로 교체하면 리프레시 기능 제외한 auth체크를 한다.
    //미들웨어 내의 작업에서도 리프레시 쿠키 셋업이 잘 된다.
    //위 코드를 쓰면 매 요청에 리프레시를 포함한 체크를 하는데.. 성능차이가 많이있을까?
    //1ms의 차이도 없다. 성능 완전동일. 그래도 잘 생각해보고 쓰자.
    //const authResult = await this.userService.authMiddleware(req);

    if (authResult.success == true) {
      //req.user에 담아준다.
      req.user = authResult;
      next();
    } else {
      this.logger.error(`Blocked unknown user`);
      //적절한 리턴 보내서 예외처리 쉽게하자.
      //지금은 그냥 false 해놓았음
      res.send(false);
      return;
    }
  }
}
