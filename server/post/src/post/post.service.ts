import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CommentDto, PostDto, CocommentDto } from './dto/post.dto';
import { CommentItemContent, UploadMessage } from 'sns-interfaces';
import { AmqpService } from 'src/amqp/amqp.service';
import { crypter } from 'src/common/crypter';
import { CocommentContent } from 'sns-interfaces/client.interface';
import { PostRepository } from './post.repo';
import { AddLikeType } from 'src/amqp/handler/exchange.handler';
import { SearchService } from './search.service';
import { AlertDto, UserTagAlertReqForm } from 'sns-interfaces/alert.interface';

const tagUser = 'tagUser';
type HandleUserTagReqBody = {
  //유저태그 추출할 텍스트
  text: string;
  type: 'post' | 'comment' | 'cocomment';
  whereId: number | string;
  userId: number;
};

export class PostService {
  constructor(
    private postRepo: PostRepository,
    @Inject(forwardRef(() => AmqpService)) private amqpService: AmqpService,
    private searchService: SearchService,
  ) {}

  //userId를 int로 바꾸고 쿼리빌더로 insert 성공
  posting(content: UploadMessage) {
    //필요한 데이터만 파싱 후 포스트테이블에 내용 삽입
    const postDto: PostDto = {
      postId: content.postId,
      userId: content.userId,
      title: content.title,
    };
    //태그 핸들링 요청, 테이블 삽입 요청, 유저태그 알람전송 요청
    this.searchService.handlePostTag(postDto);
    this.postRepo.addPost(postDto);
    this.handleUserTag({
      type: 'post',
      userId: Number(crypter.decrypt(postDto.userId)),
      text: postDto.title,
      whereId: postDto.postId,
    });
    return;
  }

  async addComment(commentDto: CommentDto) {
    const insertedRow = await this.postRepo.addComment(commentDto);

    const decUserId = Number(crypter.decrypt(commentDto.userId));
    const decPostOwnerUserId = Number(
      crypter.decrypt(commentDto.postOwnerUserId),
    );
    console.log(commentDto.postOwnerUserId);

    this.handleUserTag({
      type: 'comment',
      userId: decUserId,
      text: commentDto.comment,
      whereId: insertedRow.id,
    });

    if (decPostOwnerUserId === decUserId) {
      return;
    }
    const alertForm: AlertDto = {
      userId: decPostOwnerUserId,
      content: {
        type: 'comment',
        postId: commentDto.postId,
        commentId: insertedRow.id,
        userId: decUserId,
      },
    };

    return this.amqpService.sendMsg('alert', alertForm, 'addComment');
  }

  async addCocomment(cocommentDto: CocommentDto) {
    const insertedRow = await this.postRepo.addCocomment(cocommentDto);

    const decUserId = Number(crypter.decrypt(cocommentDto.userId));
    const decCommentOwnerUserId = Number(
      crypter.decrypt(cocommentDto.commentOwnerUserId),
    );

    this.handleUserTag({
      type: 'cocomment',
      userId: decUserId,
      text: cocommentDto.cocomment,
      whereId: insertedRow.id,
    });

    if (decCommentOwnerUserId === decUserId) {
      return;
    }

    const alertForm: AlertDto = {
      userId: decCommentOwnerUserId,
      content: {
        type: 'cocomment',
        commentId: cocommentDto.commentId,
        cocommentId: insertedRow.id,
        userId: decUserId,
      },
    };

    return this.amqpService.sendMsg('alert', alertForm, 'addCocomment');
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

  async deletePost(data: { postId: string; userId: string }) {
    //pgdg에서 포스트삭제
    this.postRepo.postTable.db.delete(data.postId).then((res) => {
      console.log(res);
    });
    //엘라스틱에서 포스트삭제, 태그카운트 감소
    this.searchService.deletePost(data);
    return;
  }

  async deleteComment(data: { commentId: string; postId: string }) {
    // comment Id로 삭제, post에서 commentCount감소
    this.postRepo.commentTable.db.delete(data.commentId);
    this.postRepo.postTable.db.decrement(
      { id: data.postId },
      'commentcount',
      1,
    );
    //결과체크하려면 .then 콘솔찍으면 됨
    return;
  }
  async deleteCocomment(data: { cocommentId: string; commentId: string }) {
    //cocomment Id로 삭제, comment에서 cocommentCount감소
    this.postRepo.cocommentTable.db.delete(data.cocommentId);
    this.postRepo.commentTable.db.decrement(
      { id: Number(data.commentId) },
      'cocommentcount',
      1,
    );
    return;
  }

  handleUserTag(body: HandleUserTagReqBody) {
    console.log(body);
    //title로부터 유저태그만을 추출
    const usertags = body.text.match(/@\S+/g)?.map((item) => {
      return item.substring(1);
    });

    if (usertags === undefined) {
      return;
    }

    const alertForm: UserTagAlertReqForm = {
      usernames: [...new Set(usertags)],
      content: {
        type: 'tag',
        where: body.type,
        whereId: body.whereId,
        userId: body.userId,
      },
    };

    return this.amqpService.sendMsg('alert', alertForm, tagUser);
  }
}
