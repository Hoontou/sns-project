export interface userinfo {
  username: string;
  img: string;
  introduceName: string;
}

interface Container {
  [key: string]: { userList: userinfo[]; timer: NodeJS.Timeout };
}

class CacheManager {
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
    target: string;
  }) {
    // console.log(`캐시적재,  ${data.type} container, target is ${data.target}`);

    this.containers[data.type][data.target] = {
      userList: data.userList,
      timer: setTimeout(() => {
        delete this.containers[data.type][data.target];
      }, this.removeCount),
    };
  }

  /**캐시에서 가져오기 */
  getUserList(data: {
    type: 'follower' | 'following' | 'like';
    target: string;
    searchString: string;
  }): userinfo[] | undefined {
    const container = this.containers[data.type][data.target];

    if (container) {
      //clear함수로 안없애주면 이전타이머 안없어짐
      clearTimeout(container.timer);
      container.timer = setTimeout(() => {
        delete this.containers[data.type][data.target];
      }, this.removeCount);
      return container.userList;
    }

    return undefined;
  }
}

export const cacheManager = new CacheManager();
