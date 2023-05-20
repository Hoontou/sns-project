import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AmqpService } from 'src/common/amqp/amqp.service';
import { FflGrpcService } from 'src/grpc/grpc.services';
import { UserService } from '../user/user.service';
import { crypter } from 'src/common/crypter';

@Injectable()
export class FflService {
  private logger = new Logger(FflService.name);
  private fflGrpcService: FflGrpcService;
  constructor(
    @Inject('ffl') private client: ClientGrpc,
    private amqpService: AmqpService,
    private userService: UserService,
  ) {}
  onModuleInit() {
    this.fflGrpcService = this.client.getService<FflGrpcService>('FflService');
  }

  async addFollow(body: { userTo: string; userFrom: string }) {
    this.amqpService.sendMsg('ffl', body, this.addFollow.name);
    this.amqpService.sendMsg('user', body, this.addFollow.name);
  }
  async removeFollow(body: { userTo: string; userFrom: string }) {
    this.amqpService.sendMsg('ffl', body, this.removeFollow.name);
    this.amqpService.sendMsg('user', body, this.removeFollow.name);
  }

  async checkFollowed(body: {
    userId: string;
    myId: string;
  }): Promise<{ followed: boolean }> {
    return lastValueFrom(this.fflGrpcService.checkFollowed(body));
  }

  async addLike(body: { userId: string; postId: string }) {
    // this.amqpService.sendMsg('ffl', body, this.addLike.name);
    // this.amqpService.sendMsg(
    //   'post',
    //   { postId: body.postId },
    //   this.addLike.name,
    // );
    this.amqpService.publishMsg('addLike', body);
  }
  async removeLike(body: { userId: string; postId: string }) {
    // this.amqpService.sendMsg('ffl', body, this.removeLike.name);
    // this.amqpService.sendMsg(
    //   'post',
    //   { postId: body.postId },
    //   this.removeLike.name,
    // );
    this.amqpService.publishMsg('removeLike', body);
  }

  async checkLiked(body: {
    userId: string;
    postId: string;
  }): Promise<{ liked: boolean }> {
    return lastValueFrom(this.fflGrpcService.checkLiked(body));
  }

  async getUserList(body: {
    id: string;
    type: 'like' | 'follower' | 'following';
  }): Promise<{
    userList: { userId: string; img: string; username: string }[];
  }> {
    const { userIds } = await lastValueFrom(
      this.fflGrpcService.getUserIds(body),
    );
    const { userList } = await this.userService.getUsernameWithImgList(userIds);

    return {
      userList: userList.map((item) => {
        return { ...item, userId: crypter.encrypt(item.userId) };
      }),
    };
  }

  async addCommentLike(body: { userId: string; commentId: number }) {
    //ffl msa에서 commentId, userId를 commentLikeSchema에 삽입
    //post msa에서 comment의 likescount 증가
    this.amqpService.publishMsg('addCommentLike', body);
  }

  async removeCommentLike(body: { userId: string; commentId: number }) {
    //ffl msa에서 commentId, userId를 commentLikeSchema에 삭제
    //post msa에서 comment의 likescount 감소
    this.amqpService.publishMsg('removeCommentLike', body);
  }

  async getCommentLiked({
    commentIdList,
    userId,
  }: {
    commentIdList: number[];
    userId: string;
  }) {
    return lastValueFrom(
      this.fflGrpcService.getCommentLiked({ commentIdList, userId }),
    );
  }
}
