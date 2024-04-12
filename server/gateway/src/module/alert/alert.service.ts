import { Injectable } from '@nestjs/common';
import {
  AlertContentUnion,
  AlertDto,
  UploadAlertDto,
  UserTagAlertReqForm,
} from 'sns-interfaces/alert.interface';
import { AlertCollection } from './repository/alert.collection';
import { UserCollection } from '../user/repository/user.collection';
import { HandleUserTagReqBody } from '../post/interface';
import {
  AlertSchemaDefinition,
  AlertSchemaDefinitionExecPop,
} from './repository/schema/alert.schema';
import { crypter } from 'src/common/crypter';

export interface FianlAlertType {
  _id: string;
  content: AlertContentUnion & {
    userinfo?: { username: string; img: string };
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
    userId: number;
  }): Promise<{ hasNewAlert: boolean }> {
    const lastUnreadAlert: AlertSchemaDefinition | null =
      await this.alertCollection.getLastUnreadAlert(data.userId);

    return { hasNewAlert: lastUnreadAlert ? true : false };
  }

  async getUnreadAlert(data: {
    page: number;
    userId: number;
  }): Promise<{ unreadAlerts: FianlAlertType[] }> {
    const unreadAlerts: AlertSchemaDefinitionExecPop[] =
      await this.alertCollection.getUnreadAlerts(data.userId, data.page);

    return { unreadAlerts: this.parseAlertsToFinal(unreadAlerts) };
  }

  async getAllAlert(data: {
    page: number;
    userId: number;
  }): Promise<{ allAlerts: FianlAlertType[] }> {
    const allAlerts: AlertSchemaDefinitionExecPop[] =
      await this.alertCollection.getAllAlerts(data.userId, data.page);

    return { allAlerts: this.parseAlertsToFinal(allAlerts) };
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
    this.saveTagAlert(alertForm);

    return;
  }

  private parseAlertsToFinal(
    alerts: AlertSchemaDefinitionExecPop[],
  ): FianlAlertType[] {
    return alerts.map((i) => {
      //userId는 내보내지 않음. client본인의 userId임
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, content, userId, userPop, ...rest } = i;
      const userinfo = userPop && {
        username: userPop.username,
        img: userPop.img,
      };

      return {
        ...rest,
        content: {
          ...content,
          userinfo,
          //보낸사람의 Id 암호화
          userId: content.userId ? crypter.encrypt(content.userId) : '',
        },
        _id: _id.toString(),
      };
    });
  }
}
