import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CommentDto, PostDto, CocommentDto } from './dto/post.dto';
import { CommentItemContent, UploadMessage } from 'sns-interfaces';
import { AmqpService } from 'src/amqp/amqp.service';
import { crypter } from 'src/common/crypter';
import { CocommentContent } from 'sns-interfaces/client.interface';
import { PostRepository } from './post.repo';
import { AddLikeType } from 'src/amqp/handler/exchange.handler';
import { HashtagService } from './hashtag.service';

@Injectable()
export class PostService {
  constructor(
    private postRepo: PostRepository,
    @Inject(forwardRef(() => AmqpService)) private amqpService: AmqpService,
    private hashtagService: HashtagService,
  ) {}

  //userId를 int로 바꾸고 쿼리빌더로 insert 성공
  posting(content: UploadMessage) {
    //필요한 데이터만 파싱 후 포스트테이블에 내용 삽입
    const postDto: PostDto = {
      postId: content.postId,
      userId: content.userId,
      title: content.title,
    };
    //태그 핸들링 요청, 테이블 삽입 요청
    this.postRepo.addPost(postDto);
    this.hashtagService.handleHashtag(postDto);
    return;
  }

  addComment(commentDto: CommentDto) {
    return this.postRepo.addComment(commentDto);
  }
  addCocomment(cocommentDto: CocommentDto) {
    return this.postRepo.addCocomment(cocommentDto);
  }

  async getCommentList(data: { postId: string; page: number }) {
    const comments: CommentItemContent[] = await this.postRepo.getCommentList(
      data,
    );

    //userId 암호화
    for (const i of comments) {
      i.userId = crypter.encrypt(i.userId);
    }
    console.log(comments);
    return { comments };
  }

  async getCocommentList(data: { commentId: number; page: number }) {
    const cocomments: CocommentContent[] = await this.postRepo.getCocommentList(
      data,
    );

    //userId 암호화
    for (const i of cocomments) {
      i.userId = crypter.encrypt(i.userId);
    }
    console.log(cocomments);

    return { cocomments };
  }

  async addLike(data: AddLikeType) {
    if (data.type === 'post') {
      return this.postRepo.postTable.addLike(data);
    }
    if (data.type === 'comment') {
      return this.postRepo.commentTable.addLike(data);
    }
    if (data.type === 'cocomment') {
      return this.postRepo.cocommentTable.addLike(data);
    }
  }

  async removeLike(data: AddLikeType) {
    if (data.type === 'post') {
      return this.postRepo.postTable.removeLike(data);
    }
    if (data.type === 'comment') {
      return this.postRepo.commentTable.removeLike(data);
    }
    if (data.type === 'cocomment') {
      return this.postRepo.cocommentTable.removeLike(data);
    }
  }
}
