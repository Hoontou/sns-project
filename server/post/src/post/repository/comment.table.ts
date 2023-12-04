import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Comment } from '../entity/comment.entity';
import { CommentDto } from '../dto/post.dto';
import { pgdb } from 'src/configs/pg';
import { crypter } from 'src/common/crypter';
import { CommentItemContent } from 'sns-interfaces';

@Injectable()
export class CommentTable {
  constructor(
    @InjectRepository(Comment)
    public db: Repository<Comment>,
  ) {}

  async addComment(commentDto: CommentDto) {
    const { postId, userId, comment } = commentDto;

    const query = `INSERT INTO public.comment(
      comment, "userId", "postId")
      VALUES ('${comment}', '${crypter.decrypt(userId)}', '${postId}')
      RETURNING *;`;
    const result = await pgdb.client.query(query);

    const row: {
      id: number;
      comment: string;
      likes: number;
      cocommentcount: number;
      createdat: Date;
      userId: number;
      postId: string;
    } = result.rows[0];
    return row;
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
    const limit = 10;
    const query = `
    SELECT
    C.id AS "commentId",
    C.comment,
    C.createdat AS "createdAt",
    C."userId",
    C.likes AS "likesCount",
    C.cocommentcount AS "cocommentCount",
    A.username,
    A.img
    FROM
    (
      SELECT * FROM public.comment 
      WHERE comment."postId" = '${postId}'
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${page * limit}
      ) AS C
    JOIN public.userinfo AS A
    ON C."userId" = A."userId"
    ORDER BY createdAt DESC;
    `;

    return (await pgdb.client.query(query)).rows;
  }

  async getComment(data: { commentId: number }) {
    const query = `
    SELECT
    C.id AS "commentId",
    C.comment,
    C.createdat AS "createdAt",
    C."userId",
    C.likes AS "likesCount",
    C.cocommentcount AS "cocommentCount",
    C."postId" AS "postId",
    A.username,
    A.img
    FROM
    (
      SELECT * FROM public.comment 
      WHERE comment.id = '${data.commentId}'
      ) AS C
    JOIN public.userinfo AS A
    ON C."userId" = A."userId"
    ORDER BY createdAt DESC;
    `;
    const result = await pgdb.client.query(query);
    const rows: CommentItemContent[] = result.rows;

    return { commentItem: rows[0] };
  }
}
