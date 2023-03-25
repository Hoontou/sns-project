import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Comment } from '../entity/comment.entity';
import { CommentDto } from '../dto/post.dto';
import { pgClient } from 'src/configs/pg';

@Injectable()
export class CommentTable {
  constructor(
    @InjectRepository(Comment)
    public db: Repository<Comment>,
  ) {}

  async addComment(commentDto: CommentDto): Promise<void> {
    const { postId, userId, comment } = commentDto;

    //먼저 코멘트 테이블에 튜플 insert
    const result = await this.db
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values({
        comment: () => `'${comment}'`,
        post: () => `'${postId}'`,
        user: () => `${userId}`,
      })
      .execute();

    //코멘트의 자식인 코멘트nums insert
    //result.identifiers[0].id = insert된 튜플의 id임.
    const queryText = `INSERT INTO public.commentnums("commentId") VALUES (${result.identifiers[0].id});`;
    pgClient.query(queryText);
  }

  async addCocomment(commentId: number | string) {
    //commentnums에 카운트 업데이트
    const queryText = `UPDATE public.commentnums
    SET cocommentcount=cocommentcount+1
    WHERE "commentId"=${commentId};`;
    pgClient.query(queryText);
  }
}
//코멘트 카운트가 하나의 테이블에 있을때의 코드
// async addCocomment(commentId: number | string) {
//   await this.db
//     .createQueryBuilder()
//     .update(Comment)
//     .set({
//       cocommentcount: () => `cocommentcount + 1`,
//     })
//     .where('id = :id', { id: commentId })
//     .execute();
// }
