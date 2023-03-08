import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Cocomment } from '../entity/cocomment.entity';
import { CocommentDto } from '../dto/post.dto';

@Injectable()
export class CoCommentTable {
  constructor(
    @InjectRepository(Cocomment)
    public db: Repository<Cocomment>,
  ) {}
  async addCocomment(cocommentDto: CocommentDto) {
    const { commentId, userId, cocomment } = cocommentDto;
    //const queryText = `INSERT INTO public.comment(comment, "userId", "postId) VALUES ('${comment}', ${userId}, '${post_id}')`;
    //console.log(queryText);
    await this.db
      .createQueryBuilder()
      .insert()
      .into(Cocomment)
      .values({
        cocomment: () => `'${cocomment}'`,
        comment: () => `'${commentId}'`,
        user: () => `${userId}`,
      })
      .execute();
  }
}
