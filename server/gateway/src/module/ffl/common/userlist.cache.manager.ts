import { Injectable } from '@nestjs/common';

export interface userinfo {
  username: string;
  img: string;
  introduceName: string;
}

export const defaultUserinfo: Readonly<userinfo> = {
  username: '',
  img: '',
  introduceName: '',
};

interface Container {
  [key: string]: { userList: userinfo[]; timer: NodeJS.Timeout };
}

@Injectable()
export class CacheManager {
  private containers: { [key: string]: Container } = {
    follower: {},
    following: {},
    like: {},
  };
  private removeCount = 30000; // 30초

  // constructor() {
  //   setInterval(() => {
  //     console.log(this.containers);
  //   }, 10000);
  // }

  /**캐시에 적재 */
  loadUserList(data: {
    type: 'follower' | 'following' | 'like';
    userList: userinfo[];
    target: number | string;
  }) {
    // console.log(`캐시적재,  ${data.type} container, target is ${data.target}`);

    this.containers[data.type][data.target] = {
      userList: data.userList,
      timer: setTimeout(() => {
        delete this.containers[data.type][data.target];
      }, this.removeCount),
    };

    return;
  }

  /**캐시에서 가져오기 */
  getUserList(data: {
    type: 'follower' | 'following' | 'like';
    target: number | string;
    searchString: string;
  }): userinfo[] | undefined {
    const target = this.containers[data.type][data.target];

    if (!target) {
      return undefined;
    }

    //타이머 다시돌리고 리스트 리턴
    //clear함수로 안없애주면 이전타이머 안없어짐
    clearTimeout(target.timer);
    target.timer = setTimeout(() => {
      delete this.containers[data.type][data.target];
    }, this.removeCount);
    return target.userList;
  }
}
