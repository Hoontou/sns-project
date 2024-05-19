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

  async getCommentList(body: { postId: string; page: number }, userId: number) {
    //1 id로 코멘트 다 가져옴
    const comments: CommentItemContent[] =
      await this.commentRepository.getCommentList(body);

    if (comments.length === 0) {
      return { commentItem: [] };
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

    return {
      commentItem: commentItem.map((i) => {
        return { ...i, userId: crypter.encrypt(i.userId) };
      }),
    };
  }

  async getComment(data: { userId: number; commentId: number }) {
    const { commentItem } = await this.commentRepository.getComment(data);

    if (commentItem === undefined) {
      return {
        commentItem: [],
        userId: crypter.encrypt(data.userId),
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
      userId: crypter.encrypt(data.userId),
    };
  }

  async addComment(commentDto: CommentDto) {
    const insertedRow = await this.commentRepository.addComment(commentDto);
    //count증가
    this.postManager.increaseCommentCount(commentDto);

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

    this.alertService.saveAlert(alertForm);
    return;
  }

  async increaseCocommentCount(data: CocommentDto) {
    //comment에다가 대댓글 카운터 증가.
    return this.commentRepository.orm.increment(
      { id: data.commentId },
      'cocommentcount',
      1,
    );
  }

  deleteComment(body: { commentId: string; postId: string }) {
    // comment Id로 삭제, post에서 commentCount감소
    this.commentRepository.orm.delete(body.commentId);
    this.postManager.decreaseCommentCount(body.postId);
    return;
  }

  decrementCocommentCount(commentId: string) {
    return this.commentRepository.orm.decrement(
      { id: Number(commentId) },
      'cocommentcount',
      1,
    );
  }

  increaseLikeCount(data: { commentId: number; type: 'comment' }) {
    return this.commentRepository.orm.increment(
      { id: data.commentId },
      'likes',
      1,
    );
  }

  decreaseLikeCount(data: { commentId: number; type: 'comment' }) {
    return this.commentRepository.orm.decrement(
      { id: data.commentId },
      'likes',
      1,
    );
  }
}
