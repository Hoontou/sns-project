import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Comment } from '../entity/comment.entity';
import { CommentDto } from '../dto/post.dto';
import { pgClient } from 'src/configs/pg';
import { crypter } from 'src/common/crypter';
import { CommentItemContent } from 'sns-interfaces';

@Injectable()
export class CommentTable {
  constructor(
    @InjectRepository(Comment)
    public db: Repository<Comment>,
  ) {}

  addComment(commentDto: CommentDto) {
    const { postId, userId, comment } = commentDto;
    //n+1문제가 싫어서 걍 바닐라쿼리로 날렸음.

    const query = `INSERT INTO public.comment(
      comment, "userId", "postId")
      VALUES ('${comment}', '${crypter.decrypt(userId)}', '${postId}');`;

    return pgClient.query(query);
  }

  addCocomment(commentId: number) {
    return this.db.increment({ id: commentId }, 'cocommentcount', 1);
  }

  addLike(data: { commentId: number }) {
    return this.db.increment({ id: data.commentId }, 'likes', 1);
  }

  removeLike(data: { commentId: number }) {
    return this.db.decrement({ id: data.commentId }, 'likes', 1);
  }

  async getCommentList(
    postId: string,
    page: number,
  ): Promise<CommentItemContent[]> {
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
