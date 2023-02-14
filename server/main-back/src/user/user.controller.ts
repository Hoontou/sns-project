import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto, SignInDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('/hoc')
  @UseGuards(AuthGuard())
  hoc(@Req() req) {
    return req.user;
  }

  //   { 정상적인 bare토큰으로 hoc get리퀘스트 했을시, req.user.
  //     "id": "a6071dbf-3cfb-4b82-8863-92b78903fa91",
  //     "email": "hoontou@gmail.com",
  //     "username": "hoon",
  //     "password": "$2a$10$MKD8AKYYqriumIxQ2NsLK.uDlrb9KdIemTQEXSozJP4PidyWp0WK6",
  //     "createdAt": "2023-02-13T23:51:43.624Z"
  // }

  // { 토큰 틀렸을 시
  //   "statusCode": 401,
  //   "message": "Unauthorized"
  // }//////////////////////////////////////////////////////////////////////////////////////

  @Post('/signup')
  signUp(@Body(ValidationPipe) signupDto: SignUpDto) {
    return this.authService.signUp(signupDto);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) signinDto: SignInDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(signinDto);
  }
}
