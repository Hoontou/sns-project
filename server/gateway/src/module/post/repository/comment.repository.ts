import { Injectable } from '@nestjs/common';
import { CommentDto } from '../dto/post.dto';
import { pgdb } from 'src/configs/postgres';
import { CommentItemContent } from 'sns-interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    public readonly orm: Repository<Comment>,
  ) {}

  async getComment(data: { commentId: number }): Promise<{
    commentItem: CommentItemContent | undefined;
  }> {
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
    FROM public.comment AS C
    JOIN public.userinfo AS A ON C."userId" = A."userId"
    WHERE C.id = '${data.commentId}'
    ORDER BY 
    C.createdAt DESC;
    `;
    const result = await pgdb.client.query(query);
    const rows: CommentItemContent[] = result.rows;

    return { commentItem: rows.length === 0 ? undefined : rows[0] };
  }

  async getCommentList(data: {
    postId: string;
    page: number;
  }): Promise<CommentItemContent[]> {
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
    FROM public.comment AS C
    JOIN public.userinfo AS A ON C."userId" = A."userId"
    WHERE C."postId" = '${data.postId}'
    ORDER BY C.createdAt DESC
    LIMIT ${limit} OFFSET ${data.page * limit};
    `;

    return (await pgdb.client.query(query)).rows;
  }

  async addComment(commentDto: CommentDto) {
    const { postId, userId, comment } = commentDto;

    const query = `INSERT INTO public.comment(
      comment, "userId", "postId")
      VALUES ('${comment}', '${userId}', '${postId}')
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
}
