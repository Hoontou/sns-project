import { Controller } from '@nestjs/common';
import { AuthService } from './module/auth/auth.service';

@Controller('mock')
export class MockDataController {
  constructor(private authService: AuthService) {}

  //회원가입

  //postging
  //팔로잉
  //댓글
  //좋아요
}
