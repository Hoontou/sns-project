import { Injectable } from '@nestjs/common';
import { UserService } from './module/user/user.service';
import { FflService } from './module/ffl/ffl.service';
import { PostService } from './module/post/post.service';
import { MetadataService } from './module/metadata/metadata.service';
import { crypter } from './common/crypter';
import {
  PostFooterContent,
  PostContent,
  UserInfo,
} from 'sns-interfaces/client.interface';
import { LandingContent } from './app.controller';

@Injectable()
//AppService의 메서드 이름은 client의 페이지 이름과 매칭
export class AppService {
  constructor(
    private userService: UserService,
    private fflService: FflService,
    private postService: PostService,
    private metadataService: MetadataService,
  ) {}

  async landing(userId: string, page: number) {
    //가져올게 아무것도 없을 시 metadatas.map 에서 오류남. 추후 수정필요.

    //1 팔로우 목록 가져오기
    const { userList } = await this.fflService.getUserList({
      id: userId,
      type: 'following',
    });
    userList.push({ userId, username: '', img: '' });

    //2 유저들의 최근3일 meta 가져오기
    const { metadatas } = await this.metadataService.getMetadatasLast3Day({
      userIds: userList.map((i) => {
        return i.userId;
      }),
      page,
    });

    //3 metadata로 PostFooter 가져옴,
    //재귀적 인데 나중에 성능체크해야할듯 list로 보내는것과.
    const postFooter: PostFooterContent[] = await Promise.all(
      metadatas.map((i, index) => {
        return this.postFooter({
          userId,
          postId: i.id,
          targetId: i.userId,
        });
      }),
    );

    //4 정보들을 취합해서 하나의 리스트로 만듦.
    const combinedResult: LandingContent[] = metadatas.map((i, index) => {
      return { ...i, ...postFooter[index], userId: crypter.encrypt(i.userId) };
    });
    return { last3daysPosts: combinedResult, userId };
  }

  /**userinfo + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async userInfo(body: {
    userId: string;
    myId: '' | string;
  }): Promise<UserInfo | { success: false }> {
    // 일단 숫자를 찾는다.
    const userinfo = await this.userService.getUserinfo(body.userId);

    if (userinfo.success === false) {
      //실패했으면 바로 리턴.
      return userinfo;
    }

    // 팔로우 체크할 필요없으면 그냥 펄스넣어서 리턴.
    if (body.myId === '') {
      return { ...userinfo, followed: false };
    }
    //팔로우체크후 리턴, 여기까지왔으면 아래는 진짜 아이디만 들어감.
    //타입추론이 잘 안돼서 가독성좋게 ''로 했음.
    const { followed } = await this.fflService.checkFollowed(body);
    return { ...userinfo, followed };
  }

  /**게시글 좋아요 했나?, 게시글에 달린 좋아요수, 댓글수 리턴해야함. */
  async postFooter(body: {
    userId: string;
    postId: string;
    targetId: string;
  }): Promise<PostFooterContent> {
    //좋아요 체크, post정보, 작성자 정보 가져오기
    const [liked, postContent, userInfo] = await Promise.all([
      this.fflService.checkLiked({ userId: body.userId, postId: body.postId }),
      this.postService.getPost(body.postId),
      this.userService.getUsernameWithImg(body.targetId), //작성자 정보
    ]);

    return {
      ...liked,
      ...postContent,
      ...userInfo,
    };
  }
}
