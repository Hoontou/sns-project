import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostContent } from 'sns-interfaces/client.interface';
import { crypter } from 'src/common/crypter';
import { PostDto } from '../dto/post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entity/post.entity';
import { pgdb } from 'src/configs/postgres';

@Injectable()
export class PostRepository {
  private logger = new Logger(PostRepository.name);

  constructor(
    @InjectRepository(Post)
    public readonly orm: Repository<Post>,
  ) {}

  addPost(postDto: PostDto) {
    const { postId, userId, title } = postDto;
    this.orm
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
    return;
  }

  async getPost(postId: string): Promise<PostContent> {
    const post = await this.getPostById(postId);

    if (post === undefined) {
      this.logger.error('Err while getPost at post.repo.ts, must be not found');
      throw new NotFoundException();
    }

    return {
      _id: post.id,
      likesCount: post.likes,
      commentCount: post.commentcount,
      title: post.title,
      userId: crypter.encrypt(post.userId),
    };
  }

  async getPostIdsOrderByLikes(page: number) {
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

  private async getPostById(postId: string) {
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
}
