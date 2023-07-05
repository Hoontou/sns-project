import { Injectable } from '@nestjs/common';
import { PostTable } from './repository/post.table';
import { CommentTable } from './repository/comment.table';
import { CoCommentTable } from './repository/cocomment.table';
import { PostContent } from 'sns-interfaces/client.interface';

@Injectable()
export class PostRepository {
  constructor(
    public readonly postTable: PostTable,
    public readonly commentTable: CommentTable,
    public readonly cocommentTable: CoCommentTable,
  ) {}
  async getPost(data: { postId: string }): Promise<PostContent> {
    const post = await this.postTable.db.findOneBy({ id: data.postId });
    if (post === null) {
      throw new Error('err when getPostnums, postnums === null');
    }
    return {
      id: post.id,
      likesCount: post.likes,
      commentCount: post.commentcount,
      title: post.title,
    };
  }
  getCommentList(data: { postId: string; page: number }) {
    return this.commentTable.getCommentList(data.postId, data.page);
  }
  getCocommentList(data: { commentId: number; page: number }) {
    return this.cocommentTable.getCocommentList(data.commentId, data.page);
  }
}
