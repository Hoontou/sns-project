import { Injectable } from '@nestjs/common';

@Injectable()
export class PostService {
  async getPostnums(body: {
    userId: string;
    postId: string;
  }): Promise<{ likesCount: number; commentCount: number }> {
    return { likesCount: 0, commentCount: 0 };
  }
}
