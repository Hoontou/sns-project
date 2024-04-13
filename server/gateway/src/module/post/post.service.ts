import { Injectable, Logger } from '@nestjs/common';
import { UploadMessage } from 'sns-interfaces';
import { CocommentContent, PostContent } from 'sns-interfaces/client.interface';
import { CocommentDto, CommentDto } from './dto/post.dto';
import { AddLikeType } from './interface';
import { PostManager } from './manager/post.manager';
import { CommentManager } from './manager/comment.manager';
import { CocommentManager } from './manager/cocomment.manager';

@Injectable()
export class PostService {
  private logger = new Logger(PostService.name);

  constructor(
    private postManager: PostManager,
    private commentManager: CommentManager,
    private cocommentManager: CocommentManager,
  ) {}

  getPost(postId: string): Promise<PostContent> {
    return this.postManager.getPost(postId);
  }

  async getCommentList(body: { postId: string; page: number }, userId: number) {
    return this.commentManager.getCommentList(body, userId);
  }

  async getComment(data: { userId: number; commentId: number }) {
    return this.commentManager.getComment(data);
  }

  async getCocommentList(
    body: { commentId: number; page: number },
    userId: number,
  ): Promise<{ cocommentItem: CocommentContent[] }> {
    return this.cocommentManager.getCocommentList(body, userId);
  }

  async getHighlightCocomment(body: { cocommentId: number; userId: number }) {
    return this.cocommentManager.getHighlightCocomment(body);
  }

  async addComment(commentDto: CommentDto) {
    return this.commentManager.addComment(commentDto);
  }

  async addCocomment(cocommentDto: CocommentDto) {
    return this.cocommentManager.addCocomment(cocommentDto);
  }

  async getPostsByHashtag(
    data: { hashtag: string; page: number },
    userId: number,
  ) {
    return this.postManager.getPostsByHashtag(data, userId);
  }

  async searchPostsBySearchString(data: {
    searchString: string;
    page: number;
  }) {
    return this.postManager.searchPostsBySearchString(data);
  }

  deletePost(body: { postId: string }, req) {
    return this.postManager.deletePost(body, req.user.userId);
  }

  deleteComment(body: { commentId: string; postId: string }) {
    return this.commentManager.deleteComment(body);
  }

  deleteCocomment(body: { cocommentId: string; commentId }) {
    return this.cocommentManager.deleteCocomment(body);
  }

  async getCommentPageContent(data: { postId: string; userId: number }) {
    return this.postManager.getCommentPageContent(data);
  }

  increaseLikeCount(data: AddLikeType) {
    if (data.type === 'post') {
      return this.postManager.increaseLikeCount(data);
    }
    if (data.type === 'comment') {
      return this.commentManager.increaseLikeCount(data);
    }
    if (data.type === 'cocomment') {
      return this.cocommentManager.increaseLikeCount(data);
    }
  }

  decreaseLikeCount(data: AddLikeType) {
    if (data.type === 'post') {
      return this.postManager.decreaseLikeCount(data);
    }
    if (data.type === 'comment') {
      return this.commentManager.decreaseLikeCount(data);
    }
    if (data.type === 'cocomment') {
      return this.cocommentManager.decreaseLikeCount(data);
    }
  }

  posting(content: UploadMessage) {
    return this.postManager.posting(content);
  }

  async getPostIdsOrderByLikes(data: { page: number }) {
    return this.postManager.getPostIdsOrderByLikes(data);
  }

  getPostFooter(data: {
    userId: number;
    postId: string;
    targetUserId: number;
  }) {
    return this.postManager.getPostFooter(data);
  }
}
