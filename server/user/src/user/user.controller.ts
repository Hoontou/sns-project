import { Controller, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SignInDto, SignUpDto } from './dto/sign.dto';
import { AuthResultRes, AuthDto } from 'sns-interfaces';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  private logger = new Logger('UserController');
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @GrpcMethod('UserService', 'SignIn')
  @UsePipes(ValidationPipe)
  signIn(signInDto: SignInDto): Promise<AuthResultRes> {
    return this.authService.signIn(signInDto);
  }

  @GrpcMethod('UserService', 'Auth')
  auth(authDto: AuthDto): Promise<AuthResultRes> {
    return this.authService.auth(authDto);
  }

  @GrpcMethod('UserService', 'SignUp')
  @UsePipes(ValidationPipe)
  signUp(signUpDto: SignUpDto): Promise<{ success: boolean; msg?: string }> {
    return this.authService.signUp(signUpDto);
  }
}
