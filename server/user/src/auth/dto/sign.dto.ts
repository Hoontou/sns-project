import {
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  IsEmail,
} from 'class-validator';
//이걸로 쓴 데코레이터는 컨트롤러에서 validationPipe로 유효성체크할 수 있게 해준다.

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'passwoard only accepts eng, num',
  }) //영어랑 숫자만 가능하다는 뜻.
  password: string;
}

export class SignUpDto extends SignInDto {
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(10)
  username: string;
}
