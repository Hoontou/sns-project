import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { crypter } from 'src/common/crypter';
import { Post } from '../entity/post.entity';
import { pgdb } from 'src/configs/postgres';
import { PostDto } from '../../dto/post.dto';

@Injectable()
export class PostTable {
  private logger = new Logger(PostTable.name);
  constructor(
    @InjectRepository(Post)
    public db: Repository<Post>,
  ) {}

  async getPost(postId: string) {
    const query = `
    SELECT * FROM public.post
    WHERE id = '${postId}'
    `;

    const result = await pgdb.client.query(query);

    const rows: {
      id: string;
      title: string;
      likes: number;
      commentcount: number;
      userId: number;
    }[] = result.rows;
    return rows[0];
  }

  //새로운 포스트데이터 삽입
  addPost(postDto: PostDto) {
    const { postId, userId, title } = postDto;
    return this.db
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values({
        id: postId,
        title,
        user: () => `${crypter.decrypt(String(userId))}`,
      })
      .execute()
      .then(() => {
        // this.logger.debug('post stored in pgdb successfully');
      })
      .catch((err) => {
        this.logger.error('err when insert post table, at post.repo.ts', err);
        throw new Error(err);
      });
  }

  //코멘트 작성되서 카운트 증가
  addCommentCount(postId: string) {
    return this.db
      .createQueryBuilder()
      .update(Post)
      .set({
        commentcount: () => `commentcount + 1`,
      })
      .where('id = :id', { id: postId })
      .execute()
      .then(() => {
        // this.logger.debug('comment stored in pgdb successfully');
      })
      .catch((err) => {
        this.logger.error('err when insert post table, at post.repo.ts', err);
      });
  }

  //포스트 삭제
  delPost(postId: string) {
    return this.db
      .createQueryBuilder()
      .delete()
      .from(Post)
      .where('id = :id', { id: postId })
      .execute()
      .then(() => {
        // this.logger.debug('post deleteed in pgdb successfully');
      })
      .catch((err) => {
        this.logger.error('err when delete post, at post.repo.ts', err);
      });
  }

  increaseLikeCount(data: { postId: string }) {
    return this.db
      .createQueryBuilder()
      .update(Post)
      .set({
        likes: () => `likes + 1`,
      })
      .where('id = :id', { id: data.postId })
      .execute()
      .then(() => {
        // this.logger.debug('like added');
      })
      .catch((err) => {
        this.logger.error('err when add like, at post.repo.ts', err);
      });
  }

  decreaseLikeCount(data: { postId: string }) {
    return this.db
      .createQueryBuilder()
      .update(Post)
      .set({
        likes: () => `likes - 1`,
      })
      .where('id = :id', { id: data.postId })
      .execute()
      .then(() => {
        // this.logger.debug('like removed');
      })
      .catch((err) => {
        this.logger.error('err when remove like, at post.repo.ts', err);
      });
  }

  async getPostIdsOrderByLikes(page: number): Promise<{ _ids: string[] }> {
    const limit = 12;

    const query = `
    SELECT P.id AS _id
    FROM post AS P
    ORDER BY P.likes DESC
    LIMIT ${limit} OFFSET ${page * limit};
    `;

    const result = await pgdb.client.query(query);

    const tmp: string[] = result.rows.map((i) => {
      return i._id;
    });

    return { _ids: tmp };
  }
}
