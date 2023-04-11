import { Controller, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthResultRes, AuthDto } from 'sns-interfaces';
import { AuthService } from 'src/auth/auth.service';
import { SignInDto, SignUpDto } from './dto/sign.dto'; //validation위해서 로컬에서 가져온다.

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @GrpcMethod('AuthService', 'SignIn')
  @UsePipes(ValidationPipe)
  signIn(signInDto: SignInDto): Promise<AuthResultRes> {
    return this.authService.signIn(signInDto);
  }

  @GrpcMethod('AuthService', 'Auth')
  auth(authDto: AuthDto): Promise<AuthResultRes> {
    return this.authService.auth(authDto);
  }

  @GrpcMethod('AuthService', 'SignUp')
  @UsePipes(ValidationPipe)
  signUp(signUpDto: SignUpDto): Promise<{ success: boolean; msg?: string }> {
    return this.authService.signUp(signUpDto);
  }
}
