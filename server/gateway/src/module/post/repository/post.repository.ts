import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostContent } from 'sns-interfaces/client.interface';
import { crypter } from 'src/common/crypter';
import { PostDto, CommentDto } from '../dto/post.dto';
import { CocommentTable } from './table/cocomment.table';
import { CommentTable } from './table/comment.table';
import { PostTable } from './table/post.table';

@Injectable()
export class PostRepository {
  private logger = new Logger(PostRepository.name);

  constructor(
    public readonly postTable: PostTable,
    public readonly commentTable: CommentTable,
    public readonly cocommentTable: CocommentTable,
  ) {}
  addPost(data: PostDto) {
    return this.postTable.addPost(data);
  }
  addCommentCount(data: CommentDto) {
    return this.postTable.addCommentCount(data.postId);
  }

  decrementCommentCount(postId) {
    return this.postTable.db.decrement({ id: postId }, 'commentcount', 1);
  }

  async getPost(postId: string): Promise<PostContent> {
    const post = await this.postTable.getPost(postId);

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
  getCommentList(data: { postId: string; page: number }) {
    return this.commentTable.getCommentList(data.postId, data.page);
  }
  getCocommentList(data: { commentId: number; page: number }) {
    return this.cocommentTable.getCocommentList(data.commentId, data.page);
  }
  getCocomment(data: { cocommentId: number }) {
    return this.cocommentTable.getCocomment(data);
  }
  getPostIdsOrderByLikes(page: number) {
    return this.postTable.getPostIdsOrderByLikes(page);
  }
}
