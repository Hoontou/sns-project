import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto, SignInDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { AuthService } from '../auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  signUp(@Body(ValidationPipe) signupDto: SignUpDto): Promise<User> {
    return this.authService.signUp(signupDto);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) signinDto: SignInDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(signinDto);
  }
}
