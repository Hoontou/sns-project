import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Cocomment } from '../entity/cocomment.entity';
import { CocommentDto } from '../dto/post.dto';
import { pgdb } from 'src/configs/pg';
import { crypter } from 'src/common/crypter';
import { CocommentContent } from 'sns-interfaces/client.interface';

@Injectable()
export class CoCommentTable {
  constructor(
    @InjectRepository(Cocomment)
    public db: Repository<Cocomment>,
  ) {
    this.getCocomment({ cocommentId: 1 });
  }
  async addCocomment(cocommentDto: CocommentDto) {
    const { commentId, userId, cocomment } = cocommentDto;
    const query = `INSERT INTO public.cocomment(
        cocomment, "userId", "commentId")
        VALUES ('${cocomment}', '${crypter.decrypt(userId)}', ${commentId})
        RETURNING *;`;
    const result = await pgdb.client.query(query);

    const row: {
      id: number;
      // comment: string;
      // likes: number;
      // cocommentcount: number;
      // createdat: Date;
      // userId: number;
      // postId: string;
    } = result.rows[0];
    return row;
  }

  async getCocommentList(
    commentId: number,
    page: number,
  ): Promise<CocommentContent[]> {
    const limit = 10;
    const query = `SELECT
    C.id AS "cocommentId",
    C.cocomment,
    C.createdat AS "createdAt",
    C."userId",
    C.likes AS "likesCount",
    A.username,
    A.img
    FROM
    (
      SELECT * FROM public.cocomment 
      WHERE cocomment."commentId" = ${commentId}
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${page * limit}
      ) AS C
    JOIN public.userinfo AS A
    ON C."userId" = A."userId"
    ORDER BY createdAt DESC;
    `;

    return (await pgdb.client.query(query)).rows;
  }

  async getCocomment(data: {
    cocommentId: number;
  }): Promise<{ cocommentItem: CocommentContent }> {
    const query = `SELECT
    C.id AS "cocommentId",
    C.cocomment,
    C.createdat AS "createdAt",
    C."userId",
    C.likes AS "likesCount",
    C."commentId" AS "commentId",
    A.username,
    A.img
    FROM
    (
      SELECT * FROM public.cocomment 
      WHERE public.cocomment.id = ${data.cocommentId}
      ) AS C
    JOIN public.userinfo AS A
    ON C."userId" = A."userId"
    ORDER BY createdAt DESC;
    `;
    const result = await pgdb.client.query(query);
    const rows: {
      cocommentId: number;
      cocomment: string;
      createdAt: string;
      userId: number;
      likesCount: number;
      username: string;
      img: string;
      commentId: number;
    }[] = result.rows;

    return {
      cocommentItem: {
        ...rows[0],
        liked: false,
        userId: crypter.encrypt(rows[0].userId),
      },
    };
  }

  addLike(data: { cocommentId: number }) {
    return this.db.increment({ id: data.cocommentId }, 'likes', 1);
  }

  removeLike(data: { cocommentId: number }) {
    return this.db.decrement({ id: data.cocommentId }, 'likes', 1);
  }
}
