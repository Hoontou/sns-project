import { AlertDto, UserTagAlertReqForm } from 'sns-interfaces/alert.interface';
import { AlertRepository, alertRepository } from '../database/alert.repo';
import { UserRepository, userRepository } from '../database/user.repo';

const dupCount = 4;

class AlertService {
  constructor(
    private readonly alertDb: AlertRepository,
    private readonly userDb: UserRepository,
  ) {}
  //매번 알림 저장할 때마다 똑같은 종류의 알림이 있는지 체크 후 합쳐서 새로 저장.

  async saveCommentAlert(data: AlertDto) {
    if (data.content.type !== 'comment') {
      return;
    }

    //똑같은 알림 이미 있는지 체크한다.
    //{userId, content.postId, content.type:'comment'}
    const existCheckResult = await this.alertDb.db.find({
      userId: data.userId,
      'content.type': 'comment',
      'content.postId': data.content.postId,
    });

    if (existCheckResult[0] === undefined) {
      //저장된게 없으면?
      return this.saveAlert(data);
    }

    //여기까지왔으면 저장된게 있다.
    const doc = existCheckResult[0];

    //알람 합친다.

    if (typeof doc.content.userId === 'number') {
      return this.alertDb.db.updateOne(
        { _id: doc._id },
        {
          'content.userId': [
            ...new Set([doc.content.userId, data.content.userId]),
          ],
        },
      );
    }

    //여기까지 왔으면 이미 알림이 여러개 겹쳐져 있다.
    if (doc.content.userId.length <= dupCount) {
      return this.alertDb.db.updateOne(
        { _id: doc._id },
        {
          'content.userId': [
            ...new Set([...doc.content.userId, data.content.userId]),
          ],
        },
      );
    }

    //위 모든조건에서 팅겼으면 그냥 알림 버린다.
    return;
  }

  async saveTagAlert(data: UserTagAlertReqForm) {
    //usernames로 userId찾아온다
    const userIds = await this.userDb.findUserIdsByUsernames(data.usernames);

    return Promise.all(
      userIds.map((item) => {
        return this.saveAlert({ userId: item, content: data.content });
      }),
    );
  }

  saveAlert(alertDto: AlertDto) {
    return this.alertDb.saveAlert(alertDto);
  }
}

export const alertService = new AlertService(alertRepository, userRepository);
