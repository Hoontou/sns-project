import { Injectable } from '@nestjs/common';
import { CocommentTable } from './table/cocomment.table';
import { CocommentDto } from '../dto/post.dto';

@Injectable()
export class CocommentRepository {
  constructor(public readonly cocommentTable: CocommentTable) {}

  getCocommentList(data: { commentId: number; page: number }) {
    return this.cocommentTable.getCocommentList(data.commentId, data.page);
  }
  async addCocomment(data: CocommentDto) {
    //대댓글 테이블에 내용삽입
    return this.cocommentTable.addCocomment(data);
  }

  deleteCocomment(cocommentId: string) {
    return this.cocommentTable.db.delete(cocommentId);
  }
}
