import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Comment } from '../entity/comment.entity';
import { CommentDto } from '../dto/post.dto';

@Injectable()
export class CommentTable {
  constructor(
    @InjectRepository(Comment)
    public db: Repository<Comment>,
  ) {}

  async addComment(commentDto: CommentDto): Promise<void> {
    const { postId, userId, comment } = commentDto;
    //const queryText = `INSERT INTO public.comment(comment, "userId", "postId) VALUES ('${comment}', ${userId}, '${post_id}')`;
    //console.log(queryText);
    await this.db
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values({
        comment: () => `'${comment}'`,
        post: () => `'${postId}'`,
        user: () => `${userId}`,
      })
      .execute();
  }

  async addCocomment(commentId: number | string) {
    await this.db
      .createQueryBuilder()
      .update(Comment)
      .set({
        cocommentcount: () => `cocommentcount + 1`,
      })
      .where('id = :id', { id: commentId })
      .execute();
  }
}
