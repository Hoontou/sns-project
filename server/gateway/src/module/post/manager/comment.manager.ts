import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import { CommentItemContent } from 'sns-interfaces';
import { crypter } from '../../../common/crypter';
import { FflService } from '../../../module/ffl/ffl.service';
import { AlertDto } from 'sns-interfaces/alert.interface';
import { AlertService } from '../../../module/alert/alert.service';
import { CocommentDto, CommentDto } from '../dto/post.dto';
import { PostManager } from './post.manager';

@Injectable()
export class CommentManager {
  constructor(
    private commentRepository: CommentRepository,
    @Inject(forwardRef(() => FflService))
    private fflService: FflService,
    private alertService: AlertService,
    private postManager: PostManager,
  ) {}

  async getCommentList(body: { postId: string; page: number }, userId: string) {
    //1 id로 코멘트 다 가져옴
    const comments: CommentItemContent[] =
      await this.commentRepository.getCommentList(body);

    if (comments.length === 0) {
      return { commentItem: [] };
    }

    //userId 암호화
    for (const i of comments) {
      i.userId = crypter.encrypt(i.userId);
    }

    //2 가져온 코멘트 id로 좋아요눌렀나 체크
    const { commentLikedList } = await this.fflService.getCommentLiked({
      commentIdList: comments?.map((i) => {
        return i.commentId;
      }),
      userId,
    });

    //3 리턴할 코멘트들에 좋아요체크결과 붙여넣기
    const commentItem: CommentItemContent[] = comments?.map((item, index) => {
      return { ...item, liked: commentLikedList[index] };
    });

    return { commentItem };
  }

  async getComment(data: { userId: string; commentId: number }) {
    const { commentItem } =
      await this.commentRepository.commentTable.getComment(data);

    if (commentItem === undefined) {
      return {
        commentItem: [],
        userId: data.userId,
      };
    }

    //2 가져온 코멘트 id로 좋아요눌렀나 체크
    const { commentLikedList } = await this.fflService.getCommentLiked({
      commentIdList: [commentItem.commentId],
      userId: data.userId,
    });

    return {
      commentItem: [
        {
          ...commentItem,
          liked: commentLikedList[0],
        },
      ],
      userId: data.userId,
    };
  }

  async addComment(commentDto: CommentDto) {
    const insertedRow = await this.commentRepository.addComment(commentDto);
    //count증가
    this.postManager.addCommentCount(commentDto);

    const decUserId = Number(crypter.decrypt(commentDto.userId));
    const decPostOwnerUserId = Number(
      crypter.decrypt(commentDto.postOwnerUserId),
    );

    this.alertService.sendUserTagAlertIfExist({
      type: 'comment',
      userId: decUserId,
      text: commentDto.comment,
      whereId: insertedRow.id,
    });

    if (decPostOwnerUserId === decUserId) {
      return;
    }
    const alertForm: AlertDto = {
      userId: decPostOwnerUserId,
      content: {
        type: 'comment',
        postId: commentDto.postId,
        commentId: insertedRow.id,
        userId: decUserId,
      },
    };

    return this.alertService.saveAlert(alertForm);
  }

  async addCocommentCount(data: CocommentDto) {
    //comment에다가 대댓글 카운터 증가.
    return this.commentRepository.addCocommentCount(data);
  }

  deleteComment(body: { commentId: string; postId: string }) {
    // comment Id로 삭제, post에서 commentCount감소
    this.commentRepository.deleteComment(body.commentId);
    this.postManager.decrementCommentCount(body.postId);
    return;
  }

  decrementCocommentCount(commentId: string) {
    return this.commentRepository.decrementCocommentCount(commentId);
  }

  addLike(data: { commentId: number; type: 'comment' }) {
    return this.commentRepository.commentTable.addLike(data);
  }

  removeLike(data: { commentId: number; type: 'comment' }) {
    return this.commentRepository.commentTable.removeLike(data);
  }
}
