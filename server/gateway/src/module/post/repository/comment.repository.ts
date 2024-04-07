import { Injectable } from '@nestjs/common';
import { CommentTable } from './table/comment.table';
import { CocommentDto, CommentDto } from '../dto/post.dto';

@Injectable()
export class CommentRepository {
  constructor(public readonly commentTable: CommentTable) {}

  getCommentList(data: { postId: string; page: number }) {
    return this.commentTable.getCommentList(data.postId, data.page);
  }

  async addComment(data: CommentDto) {
    //코멘트 테이블에 코멘트 삽입
    return this.commentTable.addComment(data);
  }
  async addCocommentCount(data: CocommentDto) {
    //comment에다가 대댓글 카운터 증가.
    return this.commentTable.addCocommentCount(data.commentId);
  }

  deleteComment(commentId: string) {
    return this.commentTable.db.delete(commentId);
  }
  decrementCocommentCount(commentId: string) {
    return this.commentTable.db.decrement(
      { id: Number(commentId) },
      'cocommentcount',
      1,
    );
  }
}
