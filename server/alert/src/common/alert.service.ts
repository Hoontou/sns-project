import {
  AlertDto,
  UploadAlertDto,
  UserTagAlertReqForm,
} from 'sns-interfaces/alert.interface';
import { AlertRepository, alertRepository } from '../database/alert.repo';
import { UserRepository, userRepository } from '../database/user.repo';
import { crypter } from './crypter';

const dupCount = 4;
const pageLen = 20;

class AlertService {
  constructor(
    private readonly alertDb: AlertRepository,
    private readonly userDb: UserRepository,
  ) {}

  async checkHasNewAlert(data: { userId: string }) {
    const decUserId = Number(crypter.decrypt(data.userId));

    const unreadAlerts = await this.alertDb.db.find({
      userId: decUserId,
      read: false,
    });

    return { hasNewAlert: unreadAlerts[0] === undefined ? false : true };
  }

  async getUnreadAlert(data: { userId: number; page: number }) {
    const unreadAlerts: { [key: string]: any } = await this.alertDb.db
      .find({
        userId: data.userId,
        read: false,
      })
      .populate('userPop')
      .skip(data.page * pageLen)
      .limit(pageLen);

    const result = unreadAlerts.map((i) => {
      delete i._doc.content.userId;
      delete i._doc.userId;
      return {
        ...i._doc,
        content: {
          ...i._doc.content,
          userinfo: { username: i.userPop.username, img: i.userPop.img },
        },
      };
    });

    return { unreadAlerts: result };
  }

  async getAllAlert(data: { userId: number; page: number }) {
    const unreadAlerts: { [key: string]: any } = await this.alertDb.db
      .find({
        userId: data.userId,
      })
      .populate('userPop')
      .skip(data.page * pageLen)
      .limit(pageLen);

    const result = unreadAlerts.map((i) => {
      delete i._doc.content.userId;
      delete i._doc.userId;
      return {
        ...i._doc,
        content: {
          ...i._doc.content,
          userinfo: { username: i.userPop.username, img: i.userPop.img },
        },
      };
    });

    return { allAlerts: result };
  }

  async readAlert(data: { alert_id: string }) {
    return this.alertDb.db.updateOne({ _id: data.alert_id }, { read: true });
  }

  async deleteAlert(data: { alert_id: string }) {
    return this.alertDb.db.deleteOne({ _id: data.alert_id });
  }

  //매번 알림 저장할 때마다 똑같은 종류의 알림이 있는지 체크 후 합쳐서 새로 저장.
  /**중복 알림있으면 합쳐서 저장한다. */
  // async saveCommentAlert(data: AlertDto) {
  //   if (data.content.type !== 'comment') {
  //     return;
  //   }

  //   //1.똑같은 알림 이미 있는지 체크한다.
  //   //{userId, content.postId 부모게시글, content.type:'comment'}
  //   const existCheckResult = await this.alertDb.db.find({
  //     userId: data.userId,
  //     'content.type': 'comment',
  //     'content.postId': data.content.postId,
  //   });

  //   if (existCheckResult[0] === undefined) {
  //     //저장된게 없으면?
  //     return this.saveAlert(data);
  //   }

  //   //여기까지왔으면 저장된게 있다.
  //   const doc = existCheckResult[0];

  //   //2.알람 합친다.

  //   if (typeof doc.content.userId === 'number') {
  //     return this.alertDb.db.updateOne(
  //       { _id: doc._id },
  //       {
  //         'content.userId': [
  //           ...new Set([doc.content.userId, data.content.userId]),
  //         ],
  //       },
  //     );
  //   }

  //   //여기까지 왔으면 이미 알림이 여러개 겹쳐져 있다.
  //   if (doc.content.userId.length <= dupCount) {
  //     return this.alertDb.db.updateOne(
  //       { _id: doc._id },
  //       {
  //         'content.userId': [
  //           ...new Set([...doc.content.userId, data.content.userId]),
  //         ],
  //       },
  //     );
  //   }

  //   //위 모든조건에서 팅겼으면 그냥 알림 버린다.
  //   return;
  // }

  // async saveCocommentAlert(data: AlertDto) {
  //   if (data.content.type !== 'cocomment') {
  //     return;
  //   }

  //   //1.똑같은 알림 이미 있는지 체크한다.
  //   //{userId, content.commentId 부모댓글, content.type:'cocomment'}
  //   const existCheckResult = await this.alertDb.db.find({
  //     userId: data.userId,
  //     'content.type': 'cocomment',
  //     'content.commentId': data.content.commentId,
  //   });
  //   console.log(existCheckResult);

  //   if (existCheckResult[0] === undefined) {
  //     //저장된게 없으면?
  //     return this.saveAlert(data);
  //   }

  //   const doc = existCheckResult[0];

  //   //2.알람 합친다.

  //   if (typeof doc.content.userId === 'number') {
  //     return this.alertDb.db.updateOne(
  //       { _id: doc._id },
  //       {
  //         'content.userId': [
  //           ...new Set([doc.content.userId, data.content.userId]),
  //         ],
  //       },
  //     );
  //   }

  //   //여기까지 왔으면 이미 알림이 여러개 겹쳐져 있다.
  //   if (doc.content.userId.length <= dupCount) {
  //     return this.alertDb.db.updateOne(
  //       { _id: doc._id },
  //       {
  //         'content.userId': [
  //           ...new Set([...doc.content.userId, data.content.userId]),
  //         ],
  //       },
  //     );
  //   }

  //   //위 모든조건에서 팅겼으면 그냥 알림 버린다.
  //   return;
  // }

  async saveTagAlert(data: UserTagAlertReqForm) {
    //usernames로 userId찾아온다
    const userIds = await this.userDb.findUserIdsByUsernames(data.usernames);

    return Promise.all(
      userIds.map((item) => {
        return this.saveAlert({ userId: item, content: data.content });
      }),
    );
  }

  saveAlert(alertDto: AlertDto | UploadAlertDto) {
    return this.alertDb.saveAlert(alertDto);
  }
}

export const alertService = new AlertService(alertRepository, userRepository);
