import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Comment } from '../entity/comment.entity';
import { CommentDto } from '../dto/post.dto';
import { pgClient } from 'src/configs/pg';
import { crypter } from 'src/common/crypter';

@Injectable()
export class CommentTable {
  constructor(
    @InjectRepository(Comment)
    public db: Repository<Comment>,
  ) {}

  async addComment(commentDto: CommentDto): Promise<void> {
    const { postId, userId, comment } = commentDto;
    //n+1문제가 싫어서 걍 바닐라쿼리로 날렸음.

    const query = `INSERT INTO public.comment(
      comment, "userId", "postId")
      VALUES ('${comment}', '${crypter.decrypt(userId)}', '${postId}');`;

    await pgClient.query(query);
  }

  async addCocomment(commentId: number) {
    //commentnums에 카운트 업데이트
    return this.db.increment({ id: commentId }, 'cocommentcount', 1);
  }

  async addLike(data: { commentId: number }) {
    return this.db.increment({ id: data.commentId }, 'likes', 1);
  }

  async removeLike(data: { commentId: number }) {
    return this.db.decrement({ id: data.commentId }, 'likes', 1);
  }

  async getCommentList(postId: string, page: number) {
    const query = `SELECT
    C.id AS "commentId",
    C.comment,
    C.createdat AS "createdAt",
    C."userId",
    C.likes AS "likesCount",
    C.cocommentcount AS "cocommentCount",
    A.username,
    A.img
    FROM
    (SELECT * FROM public.comment WHERE comment."postId" = '${postId}') AS C
    JOIN
    (SELECT Q.id AS id, Q.username AS username, W.img AS img FROM public.user AS Q JOIN public.userinfo AS W ON Q.id = W."userId"
    ) AS A
    ON C."userId" = A.id
    ORDER BY createdAt DESC
     LIMIT 5 OFFSET ${page * 5};`;

    return (await pgClient.query(query)).rows;
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
