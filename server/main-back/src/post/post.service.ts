import { Injectable } from '@nestjs/common';
import { PostTable } from './repository/post.repository';
import { CommentTable } from './repository/comment.repository';
import { CoCommentTable } from './repository/cocomment.repository';
import { CommentDto, PostDto, CocommentDto } from './dto/post.dto';
import { UserTable } from '../user/repository/user.repository';
import { UsernumsTable } from 'src/user/repository/usernums.repository';

@Injectable()
export class PostService {
  constructor(
    private postTable: PostTable,
    private userTable: UserTable,
    private commentTable: CommentTable,
    private cocommentTable: CoCommentTable,
    private usernumsTable: UsernumsTable,
  ) {}

  //userId를 int로 바꾸고 쿼리빌더로 insert 성공
  async posting(postDto: PostDto): Promise<{ success: boolean }> {
    await this.postTable.addPost(postDto);
    await this.usernumsTable.addPost(postDto.userId);

    return { success: true };
  }

  async commenting(commentDto: CommentDto): Promise<{ success: boolean }> {
    await this.commentTable.addComment(commentDto);
    await this.postTable.addComment(commentDto.post_id);

    return { success: true };
  }
  //async cocommenting(cocommentDto: CocommentDto) {}
}
