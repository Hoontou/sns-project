import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Cocomment } from '../entity/cocomment.entity';
import { CocommentDto } from '../dto/post.dto';
import { pgClient } from 'src/configs/pg';

@Injectable()
export class CoCommentTable {
  constructor(
    @InjectRepository(Cocomment)
    public db: Repository<Cocomment>,
  ) {}
  async addCocomment(cocommentDto: CocommentDto) {
    const { commentId, userId, cocomment } = cocommentDto;
    //먼저 코멘트 테이블에 튜플 insert
    const result = await this.db
      .createQueryBuilder()
      .insert()
      .into(Cocomment)
      .values({
        cocomment: () => `'${cocomment}'`,
        comment: () => `'${commentId}'`,
        user: () => `${userId}`,
      })
      .execute();

    //코멘트의 자식인 코멘트nums insert
    //result.identifiers[0].id = insert된 튜플의 id임.
    const queryText = `INSERT INTO public.cocommentnums("cocommentId") VALUES (${result.identifiers[0].id});`;
    pgClient.query(queryText);
  }
}
