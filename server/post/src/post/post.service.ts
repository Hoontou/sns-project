import { Inject, Injectable, Req, forwardRef } from '@nestjs/common';
import { CommentDto, PostDto, CocommentDto } from './dto/post.dto';
import { CommentItemContent, UploadMessage } from 'sns-interfaces';

import { AmqpService } from 'src/amqp/amqp.service';
import { crypter } from 'src/common/crypter';
import { CocommentContent } from 'sns-interfaces/client.interface';
import { PostTable } from './repository/post.table';
import { CoCommentTable } from './repository/cocomment.table';
import { CommentTable } from './repository/comment.table';
import { PostRepository } from './post.repo';

@Injectable()
export class PostService {
  constructor(
    private postRepo: PostRepository,
    private postTable: PostTable,
    private commentTable: CommentTable,
    private cocommentTable: CoCommentTable,
    @Inject(forwardRef(() => AmqpService)) private amqpService: AmqpService,
  ) {}

  //userId를 int로 바꾸고 쿼리빌더로 insert 성공
  posting(content: UploadMessage) {
    //필요한 데이터만 파싱 후 포스트테이블에 내용 삽입
    const postDto: PostDto = {
      postId: content.postId,
      userId: content.userId,
      title: content.title,
    };

    this.postTable.addPost(postDto);

    return;
  }

  addComment(commentDto: CommentDto) {
    //코멘트 테이블에 코멘트 삽입, 포스트테이블에서 포스트 찾아서 코멘트 카운트 올리기
    this.commentTable.addComment(commentDto);
    //코멘트 카운터 증가.
    this.postTable.addComment(commentDto.postId);

    return;
  }
  addCocomment(cocommentDto: CocommentDto) {
    //대댓글 테이블에 내용삽입
    this.cocommentTable.addCocomment(cocommentDto);
    //comment에다가 대댓글 카운터 증가.
    this.commentTable.addCocomment(cocommentDto.commentId);
    return;
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

  async getCommentList(data: { postId: string; page: number }) {
    const comments: CommentItemContent[] = await this.postRepo.getCommentList(
      data,
    );

    //userId 암호화
    for (const i of comments) {
      i.userId = crypter.encrypt(i.userId);
    }
    return { comments };
  }

  async getCocommentList(data: { commentId: number; page: number }) {
    const cocomments: CocommentContent[] = await this.postRepo.getCocommentList(
      data,
    );

    //userId 암호화
    for (const i of cocomments) {
      i.userId = crypter.encrypt(i.userId);
    }

    return { cocomments };
  }
}
