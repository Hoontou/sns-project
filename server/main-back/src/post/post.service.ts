import { Injectable } from '@nestjs/common';
import { PostTable } from './repository/post.repository';
import { CommentTable } from './repository/comment.repository';
import { CoCommentTable } from './repository/cocomment.repository';
import { PostDto } from './dto/post.dto';
import { UserTable } from '../user/repository/user.repository';

@Injectable()
export class PostService {
  constructor(
    private postTable: PostTable,
    private userTable: UserTable,
    private commentTable: CommentTable,
    private cocommentTable: CoCommentTable,
  ) {}

  //userId를 int로 바꾸고 쿼리빌더로 insert 성공
  async posting(postDto: PostDto) {
    return this.postTable.addPost(postDto);
  }
}
