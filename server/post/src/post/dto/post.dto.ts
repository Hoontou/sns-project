import { IsNotEmpty } from 'class-validator';
//이걸로 쓴 데코레이터는 컨트롤러에서 validationPipe로 유효성체크할 수 있게 해준다.

export class PostDto {
  @IsNotEmpty()
  postId: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  userId: string; //작성자 id
}

export class CommentDto {
  @IsNotEmpty()
  comment: string;

  @IsNotEmpty()
  userId: string; //작성자

  @IsNotEmpty()
  postId: string; //부모 post id (objectid)
}

export class CocommentDto {
  @IsNotEmpty()
  cocomment: string;

  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  commentId: number | string; //부모 comment id (int)
}
