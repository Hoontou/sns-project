import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CocommentRepository } from '../repository/cocomment.repository';
import { CocommentContent } from 'sns-interfaces/client.interface';
import { crypter } from '../../../common/crypter';
import { FflService } from '../../../module/ffl/ffl.service';
import { CommentItemContent } from 'sns-interfaces';
import { CommentManager } from './comment.manager';
import { AlertDto } from 'sns-interfaces/alert.interface';
import { AlertService } from '../../../module/alert/alert.service';
import { CocommentDto } from '../dto/post.dto';

@Injectable()
export class CocommentManager {
  constructor(
    private cocommentRepository: CocommentRepository,
    private commentManager: CommentManager,
    @Inject(forwardRef(() => FflService))
    private fflService: FflService,
    private alertService: AlertService,
  ) {}

  async getCocommentList(
    body: { commentId: number; page: number },
    userId: number,
  ): Promise<{ cocommentItem: CocommentContent[] }> {
    //1 commentId로 대댓 가져옴
    const cocomments: CocommentContent[] =
      await this.cocommentRepository.getCocommentList(body);
    if (cocomments.length === 0) {
      return { cocommentItem: [] };
    }

    //userId 암호화
    for (const i of cocomments) {
      i.userId = crypter.encrypt(i.userId);
    }

    //2 대댓에 좋아요 눌렀나 체크
    const { cocommentLikedList } = await this.fflService.getCocommentLiked({
      cocommentIdList: cocomments.map((i) => {
        return i.cocommentId;
      }),
      userId,
    });

    //3 대댓 리스트에 좋아요 달아줌
    const cocommentItem = cocomments.map((item, index) => {
      return { ...item, liked: cocommentLikedList[index] };
    });

    return { cocommentItem };
  }

  async getHighlightCocomment(body: { cocommentId: number; userId: number }) {
    //1 commentId로 대댓 가져옴
    const { cocommentItem } =
      await this.cocommentRepository.cocommentTable.getCocomment(body);

    //대댓 찾기 miss나면 그냥 빈 리스트 리턴
    if (cocommentItem === undefined) {
      return { cocommentItem: [], commentItem: [] };
    }

    //프런트에서 display위해서 리스트에 담아줌
    const cocomments = [cocommentItem];

    //2 대댓에 좋아요 눌렀나 체크
    const { cocommentLikedList } = await this.fflService.getCocommentLiked({
      cocommentIdList: cocomments.map((i) => {
        return i.cocommentId;
      }),
      userId: body.userId,
    });

    //3 대댓 리스트에 좋아요 달아줌
    const cocoResult: CocommentContent[] = cocomments.map((item, index) => {
      return { ...item, liked: cocommentLikedList[index] };
    });

    if (cocommentItem.commentId === undefined) {
      return { cocommentItem: cocoResult, commentItem: [] };
    }
    const { commentItem }: { commentItem: CommentItemContent[] } =
      await this.commentManager.getComment({
        userId: body.userId,
        commentId: cocommentItem.commentId,
      });

    return { cocommentItem: cocoResult, commentItem };
  }

  async addCocomment(cocommentDto: CocommentDto) {
    const insertedRow =
      await this.cocommentRepository.addCocomment(cocommentDto);
    this.commentManager.addCocommentCount(cocommentDto);

    const decUserId = Number(crypter.decrypt(cocommentDto.userId));
    const decCommentOwnerUserId = Number(
      crypter.decrypt(cocommentDto.commentOwnerUserId),
    );

    this.alertService.sendUserTagAlertIfExist({
      type: 'cocomment',
      userId: decUserId,
      text: cocommentDto.cocomment,
      whereId: insertedRow.id,
    });

    if (decCommentOwnerUserId === decUserId) {
      return;
    }

    const alertForm: AlertDto = {
      userId: decCommentOwnerUserId,
      content: {
        type: 'cocomment',
        commentId: cocommentDto.commentId,
        cocommentId: insertedRow.id,
        userId: decUserId,
      },
    };

    return this.alertService.saveAlert(alertForm);
  }

  deleteCocomment(body: { cocommentId: string; commentId }) {
    //cocomment Id로 삭제, comment에서 cocommentCount감소
    this.cocommentRepository.deleteCocomment(body.cocommentId);
    this.commentManager.decrementCocommentCount(body.commentId);
    return;
  }

  addLike(data: { cocommentId: number; type: 'cocomment' }) {
    return this.cocommentRepository.cocommentTable.addLike(data);
  }

  removeLike(data: { cocommentId: number; type: 'cocomment' }) {
    return this.cocommentRepository.cocommentTable.removeLike(data);
  }
}
