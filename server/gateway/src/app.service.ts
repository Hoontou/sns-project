import { Injectable } from '@nestjs/common';
import { UserService } from './module/user/user.service';
import { FflService } from './module/ffl/ffl.service';
import { PostService } from './module/post/post.service';
import { PostContent } from 'sns-interfaces';
import { MetadataService } from './module/metadata/metadata.service';
import { crypter } from './common/crypter';

@Injectable()
export class AppService {
  constructor(
    private userService: UserService,
    private fflService: FflService,
    private postService: PostService,
    private metadataService: MetadataService,
  ) {}

  async landing(userId: string, page: number) {
    //팔로우 목록 가져오기
    const { userList } = await this.fflService.getUserList({
      id: userId,
      type: 'following',
    });
    userList.push({ userId, username: '', img: '' });

    //유저들의 최근3일 meta 가져오기
    const { metadatas } = await this.metadataService.getMetadatasLast3Day({
      userIds: userList.map((i) => {
        return i.userId;
      }),
      page,
    });

    const requests: Promise<
      PostContent & { liked: boolean; username: string; img: string }
    >[] = [];
    metadatas.map((i, index) => {
      //복호화 필요하지 않다는 시그널을 위해 type을 landing으로 보냄
      requests.push(
        this.postFooter({
          userId,
          postId: i._id,
          targetId: i.userId,
          type: 'landing',
        }).then((i) => {
          //무작위로 나온다면 의도대로 성공.
          console.log(index, 'complete');
          return i;
        }),
      );
    });

    //테스트 결과 promise.all의 의도대로 로그 잘찍힌다.
    //근데 분명 한번의 req로 가져오는게 아니라서 쿼리여러번, rpc개방 여러번의 오버헤드가 클것임.
    //나중에 이 api의 속도가 느리면 한번에 다 가져오는걸로 교체해야할듯
    //개발 초기단계에는 90ms 찍힌다.

    console.log('promise.all 시작점');
    const result = await Promise.all(requests);
    // const result = [{}];

    //근데.. 만약 메타데이터만 제대로 몽고에 들어갔고, 다른것들의 삽입이 늦어서
    //metadata만 채워진다면? 의 방어수단은 깊게 생각해보지 않았음...
    //만약 그런다면 result의 결과가 제대로 안채워질테고, 위 result를 빈칸으로 하는 주석을 해제 후
    //테스트 했을때에는 그냥 metadata만 넣어서 리턴이 된다.
    //client에서 api의 응답을 체크해서 postFooter파트가 비었으면 그냥 사진만 보여주는 식으로
    //해야할듯
    //메타데이터가 삽입이 안됐다? 는 잘 없을듯. metadata msa에서 하는일의 빈도가 다른애들보다 적음.

    // const combinedResult = result.map((i, index) => {
    //   return { ...i, ...metadatas[index], postId: metadatas[index]._id };
    // });
    const combinedResult = metadatas.map((i, index) => {
      return { ...i, ...result[index], postId: i._id };
    });
    return { last3daysPosts: combinedResult };
  }

  /**userinfo + 해당유저를 팔로우했는지 정보 리턴해야함. */
  async userInfo(body: { userId: string; myId: '' | string }): Promise<
    | {
        success: true;
        following: number;
        follower: number;
        postcount: number;
        username: string;
        followed: boolean;
        img: string;
        introduce: string;
      }
    | { success: false }
  > {
    //일단 숫자를 찾는다.
    const userinfo = await this.userService.getUserinfo(body.userId);

    if (userinfo.success === false) {
      //실패했으면 바로 리턴.
      return userinfo;
    }
    //성공했으면 계속진행
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
    type: 'landing' | 'postFooter';
  }): Promise<
    PostContent & {
      liked: boolean;
      username: string;
      img: string;
    }
  > {
    //ffl 가서 postId랑 userId로 liked? 체크

    const [
      { liked },
      { likesCount, commentCount, title, id },
      { username, img },
    ] = await Promise.all([
      this.checkLiked({ userId: body.userId, postId: body.postId }),
      this.getPost(body.postId),
      this.getUsernameWithImg(body.targetId, body.type),
    ]);
    return {
      liked,
      likesCount,
      commentCount,
      username,
      img,
      title,
      id,
    };
    //post 가서 postId로 count들 가져오기
  }

  //ffl가서 좋아요 눌렀는지 체크
  async checkLiked(body: {
    userId: string;
    postId: string;
  }): Promise<{ liked: boolean }> {
    return this.fflService.checkLiked(body);
  }
  //post 가서 카운트 가져오기
  async getPost(postId: string): Promise<PostContent> {
    return this.postService.getPost(postId);
  }
  /**복호화 필요 여부에 따라 type 결정 필요하면 postFooter */
  async getUsernameWithImg(
    targetId: string,
    type: 'landing' | 'postFooter',
  ): Promise<{ username: string; img: string }> {
    //type이 landing일 시 복호화 필요없음.
    return this.userService.getUsernameWithImg(
      type === 'landing' ? targetId : crypter.decrypt(targetId),
    );
  }
}
