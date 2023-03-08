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
    const { post_id, userId, comment } = commentDto;
    //const queryText = `INSERT INTO public.comment(comment, "userId", "postId) VALUES ('${comment}', ${userId}, '${post_id}')`;
    //console.log(queryText);
    await this.db
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values({
        comment: () => `'${comment}'`,
        post: () => `'${post_id}'`,
        user: () => `${userId}`,
      })
      .execute();
  }
}
