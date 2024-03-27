import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CommentItemContent } from 'sns-interfaces';
import {
  CocommentContent,
  PostContent,
  PostFooterContent,
} from 'sns-interfaces/client.interface';
import { FflService } from '../ffl/ffl.service';
import { AmqpService } from 'src/module/amqp/amqp.service';
import { MetadataService } from '../metadata/metadata.service';
import { AppService } from 'src/app.service';
import { crypter } from 'src/common/crypter';
import { UserService } from '../user/user.service';
import { PostRepository } from './post.repository';
import { CocommentDto, CommentDto } from './dto/post.dto';
import { AlertDto, UserTagAlertReqForm } from 'sns-interfaces/alert.interface';
import { SearchService } from './search.service';
import { AlertService } from '../alert/alert.service';

const tagUser = 'tagUser';
type HandleUserTagReqBody = {
  //유저태그 추출할 텍스트
  text: string;
  type: 'post' | 'comment' | 'cocomment';
  whereId: number | string;
  userId: number;
};

export type AddLikeType = AddLikePost | AddLikeComment | AddLikeCocomment;
export interface AddLikePost {
  postId: string;
  type: 'post';
}
export interface AddLikeComment {
  commentId: number;
  type: 'comment';
}
export interface AddLikeCocomment {
  cocommentId: number;
  type: 'cocomment';
}

@Injectable()
export class PostService {
  constructor(
    @Inject(forwardRef(() => FflService))
    private fflService: FflService,
    private amqpService: AmqpService,
    @Inject(forwardRef(() => MetadataService))
    private metadataService: MetadataService,
    @Inject(forwardRef(() => AppService))
    private appService: AppService,
    private userService: UserService,
    private postRepo: PostRepository,
    private searchService: SearchService,
    private alertService: AlertService,
  ) {}

  getPost(postId: string): Promise<PostContent> {
    return this.postRepo.getPost(postId);

    // return lastValueFrom(this.postGrpcService.getPost({ postId }));
  }

  async getCommentList(body: { postId: string; page: number }, userId: string) {
    //1 id로 코멘트 다 가져옴
    const comments: CommentItemContent[] =
      await this.postRepo.getCommentList(body);

    if (comments.length === 0) {
      return { commentItem: [] };
    }

    //userId 암호화
    for (const i of comments) {
      i.userId = crypter.encrypt(i.userId);
    }

    //2 가져온 코멘트 id로 좋아요눌렀나 체크
    const { commentLikedList } = await this.fflService.getCommentLiked({
      commentIdList: comments?.map((i) => {
        return i.commentId;
      }),
      userId,
    });

    //3 리턴할 코멘트들에 좋아요체크결과 붙여넣기
    const commentItem: CommentItemContent[] = comments?.map((item, index) => {
      return { ...item, liked: commentLikedList[index] };
    });

    return { commentItem };
  }

  async getComment(data: { userId: string; commentId: number }) {
    const { commentItem } = await this.postRepo.commentTable.getComment(data);

    if (commentItem === undefined) {
      return {
        commentItem: [],
        userId: data.userId,
      };
    }

    //2 가져온 코멘트 id로 좋아요눌렀나 체크
    const { commentLikedList } = await this.fflService.getCommentLiked({
      commentIdList: [commentItem.commentId],
      userId: data.userId,
    });

    // const postFooterResult = await this.getCommentPageContent({
    // postId: commentItem.postId,
    // userId: data.userId,
    // });

    return {
      commentItem: [
        {
          ...commentItem,
          liked: commentLikedList[0],
        },
      ],
      userId: data.userId,
      // postFooterContent: postFooterResult.postFooterContent,
    };
  }

  async getCocommentList(
    body: { commentId: number; page: number },
    userId: string,
  ): Promise<{ cocommentItem: CocommentContent[] }> {
    //1 commentId로 대댓 가져옴
    const cocomments: CocommentContent[] =
      await this.postRepo.getCocommentList(body);
    if (cocomments.length === 0) {
      return { cocommentItem: [] };
    }

    //userId 암호화
    for (const i of cocomments) {
      i.userId = crypter.encrypt(i.userId);
    }

    //2 대댓에 좋아요 눌렀나 체크
    const { cocommentLikedList } = await this.fflService.getCocommentLiked({
      cocommentIdList: cocomments.map((i) => {
        return i.cocommentId;
      }),
      userId,
    });

    //3 대댓 리스트에 좋아요 달아줌
    const cocommentItem = cocomments.map((item, index) => {
      return { ...item, liked: cocommentLikedList[index] };
    });

    return { cocommentItem };
  }

  async getHighlightCocomment(body: { cocommentId: number; userId: string }) {
    //1 commentId로 대댓 가져옴
    const { cocommentItem } =
      await this.postRepo.cocommentTable.getCocomment(body);

    //대댓 찾기 miss나면 그냥 빈 리스트 리턴
    if (cocommentItem === undefined) {
      return { cocommentItem: [], commentItem: [] };
    }

    //프런트에서 display위해서 리스트에 담아줌
    const cocomments = [cocommentItem];

    //2 대댓에 좋아요 눌렀나 체크
    const { cocommentLikedList } = await this.fflService.getCocommentLiked({
      cocommentIdList: cocomments.map((i) => {
        return i.cocommentId;
      }),
      userId: body.userId,
    });

    //3 대댓 리스트에 좋아요 달아줌
    const cocoResult: CocommentContent[] = cocomments.map((item, index) => {
      return { ...item, liked: cocommentLikedList[index] };
    });

    if (cocommentItem.commentId === undefined) {
      return { cocommentItem: cocoResult, commentItem: [] };
    }
    const { commentItem }: { commentItem: CommentItemContent[] } =
      await this.getComment({
        userId: body.userId,
        commentId: cocommentItem.commentId,
      });

    return { cocommentItem: cocoResult, commentItem };
  }

  async addComment(commentDto: CommentDto) {
    const insertedRow = await this.postRepo.addComment(commentDto);

    const decUserId = Number(crypter.decrypt(commentDto.userId));
    const decPostOwnerUserId = Number(
      crypter.decrypt(commentDto.postOwnerUserId),
    );

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

    return this.alertService.saveAlert(alertForm);
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

    return this.alertService.saveAlert(alertForm);
  }

  async getPostsByHashtag(
    data: { hashtag: string; page: number },
    userId: string,
  ) {
    //1 post에 해시태그로 게시글id 가져오기
    const { _ids, count, searchSuccess } =
      await this.searchService.getPostsIdsByHashtag(data);

    if (searchSuccess === false) {
      return { searchSuccess };
    }

    //2 metadata에 _id들로 metadata 가져오기
    const { metadatas } = await this.metadataService.getMetadatasByPostId({
      _ids,
    });

    if (metadatas === undefined) {
      return { metadatas: [], totalPostCount: count, searchSuccess, userId };
    }
    return { metadatas, totalPostCount: count, searchSuccess, userId };
  }

  async searchPostsBySearchString(data: {
    searchString: string;
    page: number;
  }) {
    //1. post에 요청날려서  string으로 매치되는 포스트들의 id를 가져옴
    const { _ids } = await this.searchService.searchPostIdsBySearchString(data);
    //2. metadata에 _id들로 metadata 가져오기
    const { metadatas } = await this.metadataService.getMetadatasByPostId({
      _ids,
    });

    if (metadatas === undefined) {
      return { metadatas: [] };
    }
    return { metadatas };
  }

  async searchHashtagsBySearchString(data: {
    searchString: string;
    page: number;
  }) {
    const { searchedTags } =
      await this.searchService.searchHashtagsBySearchString(data);

    if (searchedTags === undefined) {
      return { searchedTags: [] };
    }
    return { searchedTags };
  }

  //post, meta, user 에서 받는다,
  // 글삭제 엘라스틱에 남은 정보삭제 메타삭제 카운트감소
  //게시물에 달린 댓, 대댓, 거기붙은 좋아요 추후 삭제
  deletePost(body: { postId: string }, req) {
    //pgdg에서 포스트삭제
    this.postRepo.postTable.db.delete(body.postId).then((res) => {
      console.log(res);
    });
    //엘라스틱에서 포스트삭제, 태그카운트 감소
    this.searchService.deletePost(body);

    this.userService.decreatePostCount({ ...body, userId: req.user.userId });

    this.metadataService.deleteMetadata(body.postId);
    return;
  }

  //post에서 받는다, 게시물의 댓글카운트 감소, 댓글 삭제
  //댓글에 달린 대댓, 좋아요 추후 삭제
  deleteComment(body: { commentId: string; postId: string }) {
    // comment Id로 삭제, post에서 commentCount감소
    this.postRepo.commentTable.db.delete(body.commentId);
    this.postRepo.postTable.db.decrement(
      { id: body.postId },
      'commentcount',
      1,
    );
    //결과체크하려면 .then 콘솔찍으면 됨
    return;
  }

  deleteCocomment(body: { cocommentId: string; commentId }) {
    //cocomment Id로 삭제, comment에서 cocommentCount감소
    this.postRepo.cocommentTable.db.delete(body.cocommentId);
    this.postRepo.commentTable.db.decrement(
      { id: Number(body.commentId) },
      'cocommentcount',
      1,
    );
    return;
  }

  async getCommentPageContent(data: { postId: string; userId: string }) {
    try {
      const postContent = await this.getPost(data.postId);
      const postOwnerInfo = await this.userService.getUsernameWithImg(
        crypter.decrypt(postContent.userId),
      ); //작성자 정보

      const postFooterContent: PostFooterContent = {
        liked: false,
        ...postOwnerInfo,
        ...postContent,
        userId: String(postContent.userId),
      };

      return { postFooterContent, userId: data.userId };
    } catch (error) {
      console.log(error);

      return { postFooterContent: undefined, userId: data.userId };
    }
  }

  handleUserTag(body: HandleUserTagReqBody) {
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

  addLike(data: AddLikeType) {
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

  removeLike(data: AddLikeType) {
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
