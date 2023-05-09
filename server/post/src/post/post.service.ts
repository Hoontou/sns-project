import { Inject, Injectable, Req, forwardRef } from '@nestjs/common';
import { PostTable } from './repository/post.repository';
import { CommentTable } from './repository/comment.repository';
import { CoCommentTable } from './repository/cocomment.repository';
import { CommentDto, PostDto, CocommentDto } from './dto/post.dto';
import { UploadMessage } from 'sns-interfaces';

import { AmqpService } from 'src/amqp/amqp.service';

@Injectable()
export class PostService {
  constructor(
    private postTable: PostTable,
    private commentTable: CommentTable,
    private cocommentTable: CoCommentTable,
    @Inject(forwardRef(() => AmqpService)) private amqpService: AmqpService,
  ) {}

  //userId를 int로 바꾸고 쿼리빌더로 insert 성공
  async posting(content: UploadMessage): Promise<{ success: boolean }> {
    //필요한 데이터만 파싱 후 포스트테이블에 내용 삽입
    const postDto: PostDto = {
      postId: content.postId,
      userId: content.userId,
      title: content.title,
    };
    await this.postTable.addPost(postDto);

    //유저의 총 게시물 수 카운트 증가.
    //await this.usernumsTable.addPost(postDto.userId);

    return { success: true };
  }

  async commenting(commentDto: CommentDto): Promise<{ success: boolean }> {
    //코멘트 테이블에 코멘트 삽입, 포스트테이블에서 포스트 찾아서 코멘트 카운트 올리기
    await this.commentTable.addComment(commentDto);
    //코멘트 카운터 증가.
    await this.postTable.addComment(commentDto.postId);

    return { success: true };
  }
  async cocommenting(
    cocommentDto: CocommentDto,
  ): Promise<{ success: boolean }> {
    //대댓글 테이블에 내용삽입
    await this.cocommentTable.addCocomment(cocommentDto);
    //comment에다가 대댓글 카운터 증가.
    await this.commentTable.addCocomment(cocommentDto.commentId);

    return { success: true };
  }

  async delPost(@Req() req): Promise<void> {
    //alertForm 생성을 위해 userId, postId 파싱
    const postId: string = req.body.postId;
    await this.postTable.delPost(postId);

    // const userId = crypter.decrypt(req.user.id);
    // const alert_id = ObjectId();
    // const delAlertForm: AlertDto = {
    //   _id: alert_id,
    //   userId,
    //   content: {
    //     type: 'deletePost', // DelPost type임.
    //     postId,
    //     success: true,
    //   },
    // };
    // rabbitMQ.sendMsg('alert', delAlertForm);
  }
}
