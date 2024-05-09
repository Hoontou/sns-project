import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { StateManager } from './manager/state.manager';
const JwtSecret = process.env.JWT_SECRET || 'HowCuteMyCheeze';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: JwtSecret,
      signOptions: {
        expiresIn: '30d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, StateManager],
  exports: [AuthService],
})
export class AuthModule {}
