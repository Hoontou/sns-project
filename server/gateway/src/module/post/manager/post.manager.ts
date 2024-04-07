import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PostRepository } from '../repository/post.repository';
import {
  PostContent,
  PostFooterContent,
} from 'sns-interfaces/client.interface';
import { CommentDto, PostDto } from '../dto/post.dto';
import { MetadataService } from 'src/module/metadata/metadata.service';
import { SearchService } from '../../../module/search/search.service';
import { UserService } from '../../../module/user/user.service';
import { crypter } from '../../../common/crypter';
import { UploadMessage } from 'sns-interfaces';
import { AlertService } from '../../../module/alert/alert.service';

@Injectable()
export class PostManager {
  private logger = new Logger(PostManager.name);

  constructor(
    private postRepository: PostRepository,
    @Inject(forwardRef(() => MetadataService))
    private metadataService: MetadataService,
    private searchService: SearchService,
    private userService: UserService,
    private alertService: AlertService,
  ) {}

  getPost(postId: string): Promise<PostContent> {
    return this.postRepository.getPost(postId);
  }
  addCommentCount(data: CommentDto) {
    return this.postRepository.addCommentCount(data);
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

  // 글삭제 엘라스틱에 남은 정보삭제 메타삭제 카운트감소
  deletePost(body: { postId: string }, userId) {
    //pgdg에서 포스트삭제
    this.postRepository.postTable.db.delete(body.postId);

    //엘라스틱에서 포스트삭제, 태그카운트 감소
    this.searchService.deletePost(body);

    this.userService.decreatePostCount({ ...body, userId });

    this.metadataService.deleteMetadata(body.postId);
    return;
  }
  decrementCommentCount(postId) {
    return this.postRepository.decrementCommentCount(postId);
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
      this.logger.error(error);

      return { postFooterContent: undefined, userId: data.userId };
    }
  }

  posting(content: UploadMessage) {
    //필요한 데이터만 파싱 후 포스트테이블에 내용 삽입
    const postDto: PostDto = {
      postId: content.postId,
      userId: content.userId,
      title: content.title,
    };
    //태그 핸들링 요청, 테이블 삽입 요청, 유저태그 알람전송 요청
    this.searchService.handlePostTag(postDto);
    this.postRepository.addPost(postDto);
    this.alertService.sendUserTagAlertIfExist({
      type: 'post',
      userId: Number(crypter.decrypt(postDto.userId)),
      text: postDto.title,
      whereId: postDto.postId,
    });
    return;
  }

  async getPostIdsOrderByLikes(data: { page: number }) {
    return this.postRepository.getPostIdsOrderByLikes(data.page);
  }

  addLike(data: { postId: string; type: 'post' }) {
    return this.postRepository.postTable.addLike(data);
  }

  removeLike(data: { postId: string; type: 'post' }) {
    return this.postRepository.postTable.removeLike(data);
  }
}
