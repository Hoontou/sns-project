import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt-strategy';
import { UserModule } from '../user/user.module';
import { JwtSecret } from '../common/crypter';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: JwtSecret,
      signOptions: {
        expiresIn: '30d',
      },
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    forwardRef(() => UserModule),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
