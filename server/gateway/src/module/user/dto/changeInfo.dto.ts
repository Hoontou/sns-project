import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
//이걸로 쓴 데코레이터는 컨트롤러에서 validationPipe로 유효성체크할 수 있게 해준다.

export class UsernameDto {
  @IsNotEmpty()
  @MinLength(3, {
    message: 'username이 3글자 이상 필요해요.',
  })
  @MaxLength(10, {
    message: 'username이 10글자를 초과했어요.',
  })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'username에는 영어와 숫자만 가능해요.',
  })
  username: string;
}
export class IntroduceUsernameDto {
  @MaxLength(10, {
    message: '소개이름이 10글자를 초과했어요.',
  })
  @Matches(/^[a-zA-Z0-9가-힣]*$/, {
    message: '소개 이름에는 특수문자가 들어갈 수 없어요.',
  })
  introduceName: string;
}
