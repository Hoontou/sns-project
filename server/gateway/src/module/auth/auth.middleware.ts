import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

interface Req extends Request {
  user: { userId: number };
}

//인가를 위한 미들웨어. 전역에 설치할거임
//https://docs.nestjs.com/middleware
//app.module.ts에 전역으로 설치했음. usercontroller 제외
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private logger = new Logger(AuthMiddleware.name);
  constructor(private authService: AuthService) {}

  async use(req: Req, res: Response, next: NextFunction) {
    const authResult = await this.authService.authForMiddleware(req, res);

    if (authResult.success == true) {
      req.user = authResult;
      next();
    } else {
      this.logger.error(`Blocked unknown user`);
      res.send({ success: false, msg: authResult.msg });
      return;
    }
  }
}
