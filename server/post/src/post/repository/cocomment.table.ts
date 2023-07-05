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
  ) {}
  addCocomment(cocommentDto: CocommentDto) {
    const { commentId, userId, cocomment } = cocommentDto;
    const query = `INSERT INTO public.cocomment(
        cocomment, "userId", "commentId")
        VALUES ('${cocomment}', '${crypter.decrypt(userId)}', ${commentId});`;

    return pgdb.client.query(query);
  }

  async getCocommentList(
    commentId: number,
    page: number,
  ): Promise<CocommentContent[]> {
    const limit = 4;
    const query = `SELECT
    C.id AS "cocommentId",
    C.cocomment,
    C.createdat AS "createdAt",
    C."userId",
    C.likes AS "likesCount",
    A.username,
    A.img
    FROM
    (SELECT * FROM public.cocomment WHERE cocomment."commentId" = ${commentId}) AS C
    JOIN public.userinfo AS A
    ON C."userId" = A."userId"
    ORDER BY createdAt DESC
    LIMIT ${limit} OFFSET ${page * limit};`;

    return (await pgdb.client.query(query)).rows;
  }

  addLike(data: { cocommentId: number }) {
    return this.db.increment({ id: data.cocommentId }, 'likes', 1);
  }

  removeLike(data: { cocommentId: number }) {
    return this.db.decrement({ id: data.cocommentId }, 'likes', 1);
  }
}
