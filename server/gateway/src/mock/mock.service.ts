import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { SignUpDto, UploadMessage } from 'sns-interfaces';
import { pgdb } from 'src/configs/postgres';
import { AuthService } from 'src/module/auth/auth.service';
import { FflService } from 'src/module/ffl/ffl.service';
import { PostService } from 'src/module/post/post.service';
import { UploadService } from 'src/module/upload/upload.service';

@Injectable()
export class MockDataService {
  constructor(
    private authService: AuthService,
    private uploadService: UploadService,
    private fflService: FflService,
    private postService: PostService,
  ) {}

  //회원가입
  async insertMockUser() {
    const howManyInsert = 200;

    const get5Letter = (): string => {
      const alphabets = 'abcdefghijklmnopqrstuvwxyz';

      return Array.from(
        { length: 5 },
        () => alphabets[Math.floor(Math.random() * alphabets.length)],
      ).join('');
    };

    const randomNames = Array.from({ length: howManyInsert }, (_, index) => {
      return get5Letter() + String(index);
    });

    for (const [index, i] of randomNames.entries()) {
      const dto: SignUpDto = {
        email: 'mock' + String(index) + '@gmail.com',
        password: 'test',
        username: i,
      };
      await this.authService.signUp(dto);
    }

    return 'completed';
  }

  //postging
  async insertMockPost() {
    //모든유저에게, 최소 5개, 최대 15개 삽입
    // -> 평균 10개, 유저 n명 -> 10n개.

    const lastUserId = await this.getLastUserId();

    for (let currentUserId = 1; currentUserId < lastUserId; currentUserId++) {
      //5개~ 15개
      const howMany = this.getRandomNum(5, 15);

      const mockPostList: UploadMessage[] = Array.from(
        { length: howMany },
        () => {
          return this.generateMockPost(currentUserId);
        },
      );

      for (const uploadForm of mockPostList) {
        await this.uploadService.uploadPost({ uploadForm });
      }
      await this.delay(2000);
    }

    return 'completed';
  }

  //팔로잉
  async addMockFollow() {
    const lastUserId = await this.getLastUserId();

    for (let currentUserId = 1; currentUserId < lastUserId; currentUserId++) {
      const howMany = this.getRandomNum(20, 40);

      const tmp = Array.from({ length: howMany }, () => {
        return this.getRandomNum(1, lastUserId);
      });

      for (const userTo of tmp) {
        await this.fflService.addFollow({
          userTo: String(userTo),
          userFrom: currentUserId,
        });
      }
      await this.delay(2000);
    }

    return 'completed';
  }

  //댓글
  async addMockComments() {
    const getPostquery = `
    SELECT id, "userId"
    FROM post
    `;

    const getPostresult = await pgdb.client.query(getPostquery);
    const _ids: { id: string; userId: number }[] = getPostresult.rows;

    const lastUserId = await this.getLastUserId();

    for (const { id, userId } of _ids) {
      const howMany = this.getRandomNum(5, 15);

      //해당 post에 댓글 달 유저들
      const tmp = Array.from({ length: howMany }, () => {
        return this.getRandomNum(1, lastUserId);
      });

      for (const i of tmp) {
        await this.postService.addComment({
          userId: i,
          postId: id,
          postOwnerUserId: String(userId),
          comment: titles[Math.floor(Math.random() * titles.length)],
        });
      }
      await this.delay(2000);
    }
    return 'completed';
  }

  async addMockCommentLikes() {
    const getCommentquery = `
    SELECT id
    FROM comment
    `;

    const getCommentResult = await pgdb.client.query(getCommentquery);
    const ids: { id: number }[] = getCommentResult.rows;
    console.log(ids);

    const lastUserId = await this.getLastUserId();

    for (const { id } of ids) {
      const howMany = this.getRandomNum(3, 6);

      //해당 댓글에 좋아요 누를 유저들
      const tmp = Array.from({ length: howMany }, () => {
        return this.getRandomNum(1, lastUserId);
      });

      for (const i of tmp) {
        await this.fflService.addCommentLike({
          userId: i,
          commentId: id,
        });
      }
      await this.delay(2000);
    }

    return 'completed';
  }

  //좋아요
  async addMockLikes() {
    const getPostquery = `
    SELECT id, "userId"
    FROM post
    `;

    const getPostresult = await pgdb.client.query(getPostquery);
    const _ids: { id: string; userId: number }[] = getPostresult.rows;

    const lastUserId = await this.getLastUserId();

    for (const { id, userId } of _ids) {
      const howMany = this.getRandomNum(20, 30);

      //해당 post를 like 누를 유저들
      const tmp = Array.from({ length: howMany }, () => {
        return this.getRandomNum(1, lastUserId);
      });

      for (const i of tmp) {
        await this.fflService.addLike({
          userId: i,
          postId: id,
          postOwnerUserId: String(userId),
        });
      }
      await this.delay(2000);
    }

    return 'completed';
  }

  private async delay(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private getRandomNum(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async getLastUserId() {
    const query = `
    SELECT id AS "userId"
    FROM public."user"
    ORDER BY id DESC
    LIMIT 1;
    `;
    const resultOfGetLastuserId = await pgdb.client.query(query);
    const lastUserId: number = resultOfGetLastuserId.rows[0].userId;
    return lastUserId;
  }

  private generateMockPost(userId: number): UploadMessage {
    const title = titles[Math.floor(Math.random() * titles.length)];
    const tag1 = '#' + hashtags[Math.floor(Math.random() * hashtags.length)];
    const tag2 = '#' + hashtags[Math.floor(Math.random() * hashtags.length)];

    const postId: string = new Types.ObjectId().toString();
    const postList: string[] = ['test'];

    const uploadForm: UploadMessage = {
      userId: String(userId),
      postId,
      files: postList,
      title: tag1 + ' ' + tag2 + ' ' + title,
    };

    return uploadForm;
  }
}
const titles: Readonly<string[]> = [
  '내 방 창문은 북쪽을 향해 있어 하루 종일 해가 들지 않어',
  '삭막함에 화분을 키워도 순식간에 시들시들해지잖아',
  '내 방처럼 나도 변해가고 있어 좁고 어둡게 작고 어둡게',
  '이건 슬픈 자기소개서 친구들아 sing it together',
  '난 핸들이 고장 난 8(eight)톤 트럭 내 인생은 언제나 삐딱선',
  'sun like one piece sun comes up and down 일출몰의 반복이 서둘러 내 방에 달력을 넘긴다',
  `왜 이리 크냐 어린 꼬마들의 키가
  때론 명예 돈 욕심도 조금 납니다
  제발 떠나가지 마라 내 님아`,
  `재미난 영화를 봐도 다
  거기서 거기`,
  `너말고 딴 여자는
  다 거기서 거기`,
  `너는 뛰쳐나가 차문을 부술듯이 닫으면서
  난 머리를 처박고 한숨쉬어 핸들을 안으면서`,
  `명품 쇼핑할때처럼 너무 깐깐해 니 기준은
  한번 화내면 뒷끝 장난아냐 적어도 2주는 가니까`,
  `사실은 나도 잘 모르겠어
  불안한 마음은 어디에서 태어나`,
  `우리에게까지 온 건지
  나도 모르는 새에 피어나`,
  `그러니 우린 손을 잡아야 해
  바다에 빠지지 않도록`,
  `넌 뭘 해도 예쁘니까 화장하지마
  스케줄 비워놨으니까 딴 데 가지마`,
  `아직 난 널 잊지 못하고 모든걸 다 믿지 못하고
  이렇게 널 보내지 못하고 오늘도`,
  `다시 만들어볼게 우리 이야기
  끝나지 않게 아주 기나긴`,
  `이렇게 난 또 (Fiction in Fiction)
  잊지 못하고 (Fiction in Fiction)`,
  `널 붙잡을게 (Fiction in Fiction)
  놓지 않을게 (Fiction in Fiction in Fiction)`,
  `끝나지 않은 너와
  나의 이야기 속에서 오늘도 in Fiction`,
  `너는 내 취향저격 내 취향저격
  말하지 않아도 느낌이 와`,
  `머리부터 발끝까지 다
  너는 내 취향저격 난 너를 보면`,
  `A girl 잠시 말 좀 물을게
  그 까칠한 말투는 어디서 또 배웠대`,
  `우리 엄만 매일 내게 말했어
  언제나 남자 조심하라고`,
  `엄마 말이 꼭 맞을지도 몰라
  널 보면 내 맘이 뜨겁게 달아올라`,
  `살짝 웃으며 귀 뒤로 쓸어 넘기던
  까만 밤보다 아름다운 네 머릿결`,
  `하나씩 나눠 가졌던 입술
  뜨거운 키스는 이른 아침 이슬처럼 촉촉해`,
  `물속을 걷듯 느리게 흘러가 우린 사랑을 나눌 땐
  마치 끝없이 해변을 어루만지는 파도의 끝`,
  `널 데려다주던 길은 항상 아쉬웠지
  때론 느리게 차를 몰고`,
  `한 손은 핸들 한 손은 너의 손
  시간은 지금처럼 거의 늦은 새벽어둠 속`,
  `기분에 맞는 음악을 틀고
  달렸던 외관 순환 도로`,
  `내 어깨에 기대지 못해 넓은 차가 싫다며
  농담을 하고 너의 집 앞 골목`,
  `달빛 아래 차는 정신없이
  흔들렸고 역시 이럴 땐 큰 차가 좋다며
  웃던 기억들이 떠올라`,
  `변한건 별로 없어 나이 한 살 더 먹었을 뿐
  이별도 처음 몇 번이 힘든 거지 이젠 좀 무감각해`,
  `어느새 마지막 한 장을 넘기는 날 발견해.
  어쩌면 이런 게 상실의 순기능.`,
  `비가 오잖아 마치 기다린 것처럼
  하필 우리가 헤어진 지금`,
  `평소 같은 날들과
  할 일 없는 나의 인생 그의 사이로
  너가 들어와`,
  `줬음 싶어
  평소같이 티비나 보고`,
  `하루종일 너와
  의미 없이 걷다가`,
  `술을 약간 마셨지만
  혀는 꼬이지 않고`,
  `술이 물처럼 넘어가네
  오늘따라`,
  `몸이 예전 같지 않은 걸 내 마음이 모르나 봐
때마침 네가 좋아했던 옛 노래도 흐르니`,
  `위험해, 위험해
  속 시원하게 운다`,
  `구차하게 내 탓, 네 탓
  이 쓸쓸한 날씨 탓 하긴 싫다`,
  `마음 편히 널 그리워할래
  인생 뭐 있냐, 어차피 알 수 없는 내일인데`,
  `마음이 약해질 수록 술이 더 세지네
  이런 내가 싫겠지만 이해해`,
  `인생 뭐 있냐 몇 장 뒤엔 마지막 페이지인데
  I know, I know you will never take me back`,
];

const hashtags: Readonly<string[]> = [
  `하루종일`,
  `시간아멈춰`,
  `에픽하이`,
  `다듀`,
  `죽일놈`,
  `상실의순기능`,
  `외곽순환도로`,
  `티격태격`,
  `씨스루`,
  `자니`,
  `불장난`,
  `fiction`,
  `비가오잖아`,
  `비오는날듣기좋은노래`,
  `포장마차`,
  `헤어질걸알아`,
  `취하고싶다`,
  `빗속으로`,
  `당신과는천천히`,
  `오늘은가지마`,
  `위잉위잉`,
  `동경소녀`,
  `아마도그건`,
  `정류장`,
  `물음표`,
  `갖고놀래`,
  `멜로디`,
  `달려`,
  `호랑이소굴`,
  `뜨래요`,
  `북향`,
  `그게뭐라고`,
  `감아`,
  `지나쳐`,
  `비오는날뭐해`,
  `시차`,
  `사랑을했다`,
  `서울의달`,
  `자니`,
  `하루살이`,
  `길성준`,
  `하하`,
  `유재석`,
  `박명수`,
  `정준하`,
  `노홍철`,
  `정형돈`,
];
