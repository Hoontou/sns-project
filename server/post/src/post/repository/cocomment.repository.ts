import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Cocomment } from '../entity/cocomment.entity';
import { CocommentDto } from '../dto/post.dto';
import { pgClient } from 'src/configs/pg';
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

    return pgClient.query(query);
  }

  async getCocommentList(data: {
    commentId: number;
    page: number;
  }): Promise<CocommentContent[]> {
    const query = `SELECT
    C.id AS "cocommentId",
    C.cocomment,
    C.createdat AS "createdAt",
    C."userId",
    C.likes AS "likesCount",
    A.username,
    A.img
    FROM
    (SELECT * FROM public.cocomment WHERE cocomment."commentId" = ${
      data.commentId
    }) AS C
    JOIN
    (SELECT Q.id AS id, Q.username AS username, W.img AS img FROM public.user AS Q JOIN public.userinfo AS W ON Q.id = W."userId"
    ) AS A
    ON C."userId" = A.id
    ORDER BY createdAt DESC
    LIMIT 4 OFFSET ${data.page * 4};`;

    return (await pgClient.query(query)).rows;
  }

  addLike(data: { cocommentId: number }) {
    return this.db.increment({ id: data.cocommentId }, 'likes', 1);
  }

  removeLike(data: { cocommentId: number }) {
    return this.db.decrement({ id: data.cocommentId }, 'likes', 1);
  }
}
