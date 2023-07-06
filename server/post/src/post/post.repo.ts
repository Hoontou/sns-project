import { Injectable } from '@nestjs/common';
import { PostTable } from './repository/post.table';
import { CommentTable } from './repository/comment.table';
import { CoCommentTable } from './repository/cocomment.table';
import { PostContent } from 'sns-interfaces/client.interface';
import { CocommentDto, CommentDto, PostDto } from './dto/post.dto';

@Injectable()
export class PostRepository {
  constructor(
    public readonly postTable: PostTable,
    public readonly commentTable: CommentTable,
    public readonly cocommentTable: CoCommentTable,
  ) {}
  addPost(data: PostDto) {
    return this.postTable.addPost(data);
  }
  async addComment(data: CommentDto) {
    //코멘트 테이블에 코멘트 삽입
    await this.commentTable.addComment(data);
    //코멘트 카운터 증가.
    await this.postTable.addComment(data.postId);
    return;
  }
  async addCocomment(data: CocommentDto) {
    //대댓글 테이블에 내용삽입
    await this.cocommentTable.addCocomment(data);
    //comment에다가 대댓글 카운터 증가.
    await this.commentTable.addCocomment(data.commentId);
    return;
  }

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
