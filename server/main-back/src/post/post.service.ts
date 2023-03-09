import { Injectable, Req } from '@nestjs/common';
import { PostTable } from './repository/post.repository';
import { CommentTable } from './repository/comment.repository';
import { CoCommentTable } from './repository/cocomment.repository';
import { CommentDto, PostDto, CocommentDto } from './dto/post.dto';
import { UserTable } from '../user/repository/user.repository';
import { UsernumsTable } from 'src/user/repository/usernums.repository';
import { rabbitMQ } from 'src/common/amqp';
import { AlertDto } from '../common/interface';
import { crypter } from 'src/common/crypter';
import { ObjectId } from '../common/gen.objectid';

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
    //코멘트 테이블에 코멘트 삽입, 포스트테이블에서 포스트 찾아서 코멘트 카운트 올리기
    await this.commentTable.addComment(commentDto);
    await this.postTable.addComment(commentDto.postId);

    return { success: true };
  }
  async cocommenting(
    cocommentDto: CocommentDto,
  ): Promise<{ success: boolean }> {
    await this.cocommentTable.addCocomment(cocommentDto);
    await this.commentTable.addCocomment(cocommentDto.commentId);

    return { success: true };
  }

  async delPost(@Req() req): Promise<void> {
    //alertForm 생성을 위해 userId, postId 파싱
    const postId: string = req.body.postId;
    await this.postTable.delPost(postId);

    const userId = crypter.decrypt(req.user.id);
    const alert_id = ObjectId();
    const delAlertForm: AlertDto = {
      _id: alert_id,
      userId,
      content: {
        type: 'deletePost',
        postId,
        success: true,
      },
    };
    rabbitMQ.sendMsg('alert', delAlertForm);
  }
}
