import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CommentItemContent } from 'sns-interfaces';
import {
  CocommentContent,
  PostContent,
  PostFooterContent,
} from 'sns-interfaces/client.interface';
import { PostGrpcService } from 'src/grpc/grpc.services';
import { FflService } from '../ffl/ffl.service';
import { AmqpService } from 'src/module/amqp/amqp.service';
import { MetadataService } from '../metadata/metadata.service';
import { AppService } from 'src/app.service';

@Injectable()
export class PostService {
  private postGrpcService: PostGrpcService;
  constructor(
    @Inject('post') private client: ClientGrpc,
    private fflService: FflService,
    private amqpService: AmqpService,
    private metadataService: MetadataService,
    @Inject(forwardRef(() => AppService))
    private appService: AppService,
  ) {}
  onModuleInit() {
    this.postGrpcService =
      this.client.getService<PostGrpcService>('PostService');
  }
  async getPost(postId: string): Promise<PostContent> {
    return lastValueFrom(this.postGrpcService.getPost({ postId }));
  }

  async getCommentList(body: { postId: string; page: number }, userId: string) {
    //1 id로 코멘트 다 가져옴
    const { comments } = await lastValueFrom(
      this.postGrpcService.getCommentList({
        postId: body.postId,
        page: body.page,
      }),
    );
    if (comments === undefined) {
      return { commentItem: [] };
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

  async getCocommentList(
    body: { commentId: number; page: number },
    userId: string,
  ): Promise<{ cocommentItem: CocommentContent[] }> {
    //1 commentId로 대댓 가져옴
    const { cocomments } = await lastValueFrom(
      this.postGrpcService.getCocommentList(body),
    );
    if (cocomments === undefined) {
      return { cocommentItem: [] };
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

  async addComment(data: { userId: string; postId: string; comment: string }) {
    this.amqpService.sendMsg('post', data, 'addComment');
    return;
  }
  async addCocomment(data: {
    userId: string;
    commentId: number;
    cocomment: string;
  }) {
    this.amqpService.sendMsg('post', data, 'addCocomment');
    return;
  }

  async getPostsByHashtag(
    data: { hashtag: string; page: number },
    userId: string,
  ) {
    //1 post에 해시태그로 게시글id 가져오기
    const { _ids, count, searchSuccess } = await lastValueFrom(
      this.postGrpcService.getPostsIdsByHashtag(data),
    );
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

    // //3 app.service의 postfooter메서드한테 postfooter요청

    // const postFooter: PostFooterContent[] = await Promise.all(
    //   metadatas.map((i) => {
    //     return this.appService.postFooter({
    //       userId,
    //       postId: i.id,
    //       targetId: i.userId,
    //     });
    //   }),
    // );
    // //4 리턴

    // //4 정보들을 취합해서 하나의 리스트로 만듦.
    // const combinedResult: LandingContent[] = metadatas.map((i, index) => {
    //   return { ...i, ...postFooter[index], userId: crypter.encrypt(i.userId) };
    // });
    // return { last3daysPosts: combinedResult };
  }

  async searchPostsBySearchString(data: {
    searchString: string;
    page: number;
  }) {
    //1. post에 요청날려서  string으로 매치되는 포스트들의 id를 가져옴
    const { _ids } = await lastValueFrom(
      this.postGrpcService.searchPostIdsBySearchString(data),
    );
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
    const { searchedTags } = await lastValueFrom(
      this.postGrpcService.searchHashtagsBySearchString(data),
    );
    console.log(searchedTags);

    if (searchedTags === undefined) {
      return { searchedTags: [] };
    }
    return { searchedTags };
  }

  //post, meta, user 에서 받는다,
  // 글삭제 엘라스틱에 남은 정보삭제 메타삭제 카운트감소
  //게시물에 달린 댓, 대댓, 거기붙은 좋아요 추후 삭제
  deletePost(body: { postId: string }, req) {
    return this.amqpService.publishMsg('deletePost', {
      ...body,
      userId: req.user.userId,
    });
  }

  //post에서 받는다, 게시물의 댓글카운트 감소, 댓글 삭제
  //댓글에 달린 대댓, 좋아요 추후 삭제
  deleteComment(body: { commentId: string; postId: string }, req) {
    return this.amqpService.sendMsg('post', body, 'deleteComment');
  }

  deleteCocomment(body: { cocommentId: string; commentId }, req) {
    return this.amqpService.sendMsg('post', body, 'deleteCocomment');
  }
}
