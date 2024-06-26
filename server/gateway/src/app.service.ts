import { Injectable } from '@nestjs/common';
import { UserService } from './module/user/user.service';
import { FflService } from './module/ffl/ffl.service';
import { PostService } from './module/post/post.service';
import { MetadataService } from './module/metadata/metadata.service';
import { crypter } from './common/crypter';
import { PostFooterContent, UserInfo } from 'sns-interfaces/client.interface';
import { LandingContent } from './app.controller';
import { MetadataDto } from './module/metadata/repository/metadata.collection';

@Injectable()
//AppService의 메서드 이름은 client의 페이지 이름과 매칭
export class AppService {
  constructor(
    private userService: UserService,
    private fflService: FflService,
    private postService: PostService,
    private metadataService: MetadataService,
  ) {}

  /**랜딩페이지, 팔로우목록의 최근 3일 포스트를 가져온다. */
  async getLanding(
    userId: number,
    page: number,
  ): Promise<{
    last3daysPosts: LandingContent[];
  }> {
    //1 팔로우 목록 가져오기
    const { userList } = await this.fflService.getMyFollowingUserInfos(userId);

    const userIds = userList.map((i) => {
      return i.userId;
    });
    userIds.push(userId);

    //2 유저들의 최근3일 meta 가져오기
    const { metadatas }: { metadatas: MetadataDto[] } =
      await this.metadataService.getMetadatasLast3Day({
        userIds,
        page,
      });

    //3 metadata로 PostFooter 가져옴.
    const postFooter: PostFooterContent[] = await Promise.all(
      metadatas.map((i) => {
        return this.postService.getPostFooter({
          userId,
          postId: i._id,
          targetUserId: Number(i.userId),
        });
      }),
    );

    //4 정보들을 취합해서 하나의 리스트로 만듦.
    const combinedResult: LandingContent[] = metadatas.map((i, index) => {
      return {
        ...i,
        ...postFooter[index],
        userId: postFooter[index].userId,
      };
    });

    return { last3daysPosts: combinedResult };
  }

  /**userinfo(팔로우수, 팔로잉수, 게시글수, 사진, 소개글, username) + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async getUserInfoForFeed(
    userId: number,
    targetUsername: string | undefined,
  ): Promise<
    | {
        userinfo: UserInfo;
        type: 'otherInfo' | 'myInfo';
        reqUserId: string;
        success: true;
      }
    | { success: false }
  > {
    // 일단 정보 가져옴.
    const userinfo = targetUsername
      ? await this.userService.getUserinfoByUsername(targetUsername)
      : await this.userService.getUserinfoById(userId);

    if (userinfo === undefined) {
      //실패했으면 바로 리턴.
      return { success: false };
    }

    //my or targets info
    const tmpInfo = {
      ...userinfo,
      userId: crypter.encrypt(userinfo.userId),
      id: undefined,
    };
    const encryptedMyUserId = crypter.encrypt(userId);

    // 팔로우 체크할 필요없으면 그냥 펄스넣어서 리턴.
    if (userinfo.userId === userId) {
      return {
        success: true,
        userinfo: {
          ...tmpInfo,
          followed: false,
        },
        type: 'myInfo',
        reqUserId: encryptedMyUserId,
      };
    }

    //팔로우체크후 리턴, 여기까지왔으면 아래는 진짜 아이디만 들어감.
    const { followed } = await this.fflService.checkFollowed({
      userTo: userinfo.userId, //상대를 내가 팔로우했나?
      userFrom: userId,
    });
    return {
      success: true,
      userinfo: { ...tmpInfo, followed },
      type: 'otherInfo',
      reqUserId: encryptedMyUserId,
    };
  }
}
