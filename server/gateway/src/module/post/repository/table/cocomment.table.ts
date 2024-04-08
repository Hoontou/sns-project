import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { crypter } from 'src/common/crypter';
import { CocommentContent } from 'sns-interfaces/client.interface';
import { pgdb } from 'src/configs/postgres';
import { Cocomment } from '../entity/cocomment.entity';
import { CocommentDto } from '../../dto/post.dto';

@Injectable()
export class CocommentTable {
  constructor(
    @InjectRepository(Cocomment)
    public db: Repository<Cocomment>,
  ) {}
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
    const query = `
    SELECT
    C.id AS "cocommentId",
    C.cocomment,
    C.createdat AS "createdAt",
    C."userId",
    C.likes AS "likesCount",
    A.username,
    A.img
    FROM public.cocomment AS C
    JOIN public.userinfo AS A ON C."userId" = A."userId"
    WHERE C."commentId" = ${commentId}
    ORDER BY C.createdAt DESC
    LIMIT ${limit} OFFSET ${page * limit};
    `;

    return (await pgdb.client.query(query)).rows;
  }

  async getCocomment(data: {
    cocommentId: number;
  }): Promise<{ cocommentItem: CocommentContent | undefined }> {
    const query = `
    SELECT
    C.id AS "cocommentId",
    C.cocomment,
    C.createdat AS "createdAt",
    C."userId",
    C.likes AS "likesCount",
    C."commentId",
    A.username,
    A.img
    FROM public.cocomment AS C
    JOIN public.userinfo AS A ON C."userId" = A."userId"
    WHERE C.id = ${data.cocommentId}
    ORDER BY C.createdAt DESC;
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

    return rows.length === 0
      ? { cocommentItem: undefined }
      : {
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