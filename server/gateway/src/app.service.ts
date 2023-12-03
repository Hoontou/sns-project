import { Inject, Injectable, Req, forwardRef } from '@nestjs/common';
import { UserService } from './module/user/user.service';
import { FflService } from './module/ffl/ffl.service';
import { PostService } from './module/post/post.service';
import { MetadataService } from './module/metadata/metadata.service';
import { crypter } from './common/crypter';
import { PostFooterContent, UserInfo } from 'sns-interfaces/client.interface';
import { LandingContent } from './app.controller';
import { ReqUser } from 'sns-interfaces';

/**내 정보로 접근시 userId가 내 아이디, 상대정보로 접근시 myId가 내 아이디임. */
export type UserInfoBody = MyInfoData | UserInfoData;
interface MyInfoData {
  type: 'myInfo';
  userId: string;
}
interface UserInfoData {
  type: 'otherInfo';
  targetUsername: string;
  myId: string;
}

@Injectable()
//AppService의 메서드 이름은 client의 페이지 이름과 매칭
export class AppService {
  constructor(
    private userService: UserService,
    private fflService: FflService,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
    @Inject(forwardRef(() => MetadataService))
    private metadataService: MetadataService,
  ) {}

  /**랜딩페이지, 팔로우목록의 최근 3일 포스트를 가져온다. */
  async landing(userId: string, page: number) {
    //가져올게 아무것도 없을 시 metadatas.map 에서 오류남. 추후 수정필요.

    //1 팔로우 목록 가져오기
    const { userList } = await this.fflService.getUserList({
      id: userId,
      type: 'following',
      page: -1,
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
      metadatas.map((i) => {
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
    return { last3daysPosts: combinedResult };
  }

  /**userinfo(팔로우수, 팔로잉수, 게시글수, 사진, 소개글, username) + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async userInfo(
    @Req() req,

    targetUsername: string,
  ): Promise<
    | {
        userinfo: UserInfo;
        type: 'otherInfo' | 'myInfo';
        reqUser: ReqUser;
        success: true;
      }
    | { success: false }
  > {
    const reqData: UserInfoBody =
      //내 auth정보랑 가져올 유저이름이랑 같으면 내정보 가져오기임
      req.user.username === targetUsername
        ? { type: 'myInfo', userId: req.user.userId }
        : {
            type: 'otherInfo',
            targetUsername: targetUsername,
            myId: req.user.userId,
          };

    // 일단 정보 가져옴.
    const userinfo = await this.userService.getUserinfo(reqData);

    if (userinfo.success === false) {
      //실패했으면 바로 리턴.
      return userinfo;
    }

    // 팔로우 체크할 필요없으면 그냥 펄스넣어서 리턴.
    if (reqData.type === 'myInfo') {
      return {
        success: true,
        userinfo: { ...userinfo, followed: false },
        type: reqData.type,
        reqUser: req.user,
      };
    }

    //팔로우체크후 리턴, 여기까지왔으면 아래는 진짜 아이디만 들어감.
    const { followed } = await this.fflService.checkFollowed({
      userTo: String(userinfo.userId), //상대를 내가 팔로우했나?
      userFrom: reqData.myId,
    });
    return {
      success: true,
      userinfo: { ...userinfo, followed },
      type: reqData.type,
      reqUser: req.user,
    };
  }

  /**게시글 좋아요 했나?, 게시글에 달린 좋아요수, 작정자 정보 */
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
      userId: crypter.encrypt(userInfo.userId),
    };
  }
}
