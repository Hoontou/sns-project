import { Injectable } from '@nestjs/common';
import {
  AlertContentUnion,
  AlertDto,
  UploadAlertDto,
  UserTagAlertReqForm,
} from 'sns-interfaces/alert.interface';
import { crypter } from 'src/common/crypter';
import { AlertCollection } from './repository/alert.collection';

export interface FianlAlertType {
  _id: string;
  content: AlertContentUnion & {
    userinfo: { username: string; img: string };
  };
  read: boolean;
  createdAt: Date;
}

const pageLen = 20;

@Injectable()
export class AlertService {
  constructor(private alertCollection: AlertCollection) {
    this.getAllAlert({ userId: '1', page: 0 });
  }

  async checkHasNewAlert(data: {
    userId: string;
  }): Promise<{ hasNewAlert: boolean }> {
    const decUserId = Number(crypter.decrypt(data.userId));

    const unreadAlerts = await this.alertCollection.alertModel
      .find({
        userId: decUserId,
        read: false,
      })
      .limit(1)
      .sort({ _id: -1 });

    return { hasNewAlert: unreadAlerts[0] === undefined ? false : true };
  }

  async getUnreadAlert(data: {
    page: number;
    userId: string;
  }): Promise<{ unreadAlerts: FianlAlertType[] }> {
    const unreadAlerts: { [key: string]: any } =
      await this.alertCollection.alertModel
        .find({
          userId: data.userId,
          read: false,
        })
        .populate('userPop')
        .skip(data.page * pageLen)
        .limit(pageLen)
        .sort({ _id: -1 });

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

  async getAllAlert(data: {
    page: number;
    userId: string;
  }): Promise<{ allAlerts: FianlAlertType[] }> {
    const allAlerts: { [key: string]: any } =
      await this.alertCollection.alertModel
        .find({
          userId: data.userId,
        })
        .populate('userPop')
        .skip(data.page * pageLen)
        .limit(pageLen)
        .sort({ _id: -1 });

    const result = allAlerts.map((i) => {
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

    console.log(result.length);

    return { allAlerts: result };
  }

  async readAlert(data: { alert_id: string }) {
    return this.alertCollection.alertModel.updateOne(
      { _id: data.alert_id },
      { read: true },
    );
  }
  async deleteAlert(data: { alert_id: string }) {
    this.alertCollection.alertModel.deleteOne({ _id: data.alert_id });
    return;
  }

  saveAlert(alertDto: AlertDto | UploadAlertDto) {
    return this.alertCollection.saveAlert(alertDto);
  }

  // async saveTagAlert(data: UserTagAlertReqForm) {
  //   //usernames로 userId찾아온다
  //   const userIds = await this.userDb.findUserIdsByUsernames(data.usernames);

  //   return Promise.all(
  //     userIds.map((item) => {
  //       return this.saveAlert({ userId: item, content: data.content });
  //     }),
  //   );
  // }
}
