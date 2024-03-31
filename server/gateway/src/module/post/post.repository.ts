import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostContent } from 'sns-interfaces/client.interface';
import { crypter } from 'src/common/crypter';
import { PostDto, CommentDto, CocommentDto } from './dto/post.dto';
import { CoCommentTable } from './repository/cocomment.table';
import { CommentTable } from './repository/comment.table';
import { PostTable } from './repository/post.table';

@Injectable()
export class PostRepository {
  private logger = new Logger(PostRepository.name);

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
    const row = await this.commentTable.addComment(data);
    //코멘트 카운터 증가.
    await this.postTable.addComment(data.postId);
    return row;
  }
  async addCocomment(data: CocommentDto) {
    //대댓글 테이블에 내용삽입
    const row = await this.cocommentTable.addCocomment(data);

    //comment에다가 대댓글 카운터 증가.
    await this.commentTable.addCocomment(data.commentId);
    return row;
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
