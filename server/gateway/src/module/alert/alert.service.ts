import { Injectable } from '@nestjs/common';
import {
  AlertContentUnion,
  AlertDto,
  UploadAlertDto,
  UserTagAlertReqForm,
} from 'sns-interfaces/alert.interface';
import { crypter } from 'src/common/crypter';
import { AlertCollection } from './repository/alert.collection';
import { UserCollection } from '../user/repository/user.collection';
import { HandleUserTagReqBody } from '../post/interface';

export interface FianlAlertType {
  _id: string;
  content: AlertContentUnion & {
    userinfo: { username: string; img: string };
  };
  read: boolean;
  createdAt: Date;
}

@Injectable()
export class AlertService {
  constructor(
    private userCollection: UserCollection,
    private alertCollection: AlertCollection,
  ) {}

  async checkHasNewAlert(data: {
    userId: string;
  }): Promise<{ hasNewAlert: boolean }> {
    const unreadAlerts = await this.alertCollection.alertModel
      .find({
        userId: Number(crypter.decrypt(data.userId)),
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
      await this.alertCollection.getUnreadAlerts(data.page, data.userId);

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
      await this.alertCollection.getAllAlerts(data.page, data.userId);

    const result = allAlerts.map((i) => {
      //id를 내보내지 마
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

  async saveTagAlert(data: UserTagAlertReqForm) {
    const userIds = await this.userCollection.findUserIdsByUsernames(
      data.usernames,
    );

    return Promise.all(
      userIds.map((item) => {
        return this.saveAlert({ userId: item, content: data.content });
      }),
    );
  }

  sendUserTagAlertIfExist(body: HandleUserTagReqBody) {
    //title로부터 유저태그만을 추출
    const usertags = body.text.match(/@\S+/g)?.map((item) => {
      return item.substring(1);
    });

    if (usertags === undefined) {
      return;
    }

    const alertForm: UserTagAlertReqForm = {
      usernames: [...new Set(usertags)],
      content: {
        type: 'tag',
        where: body.type,
        whereId: body.whereId,
        userId: body.userId,
      },
    };
    return this.saveTagAlert(alertForm);
  }
}
