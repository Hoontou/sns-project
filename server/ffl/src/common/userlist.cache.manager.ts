interface userinfo {
  username: string;
  img: string;
  introduceName: string;
}

interface Container {
  [key: string]: userinfo[];
}

class CacheManager {
  private followerContainer: Container = {};
  private followingContainer: Container = {};
  private likeContainer: Container = {};
  private removeCount = 6000; //60초

  loadUserList(data: {
    type: 'follower' | 'following' | 'like';
    userList: userinfo[];
    target: string;
  }) {
    console.log(`load to ${data.type} conatiner, target is ${data.target}`);

    //타입에 따라 적재
    if (data.type === 'follower') {
      this.followerContainer[data.target] = data.userList;
    }
    if (data.type === 'following') {
      this.followingContainer[data.target] = data.userList;
    }
    this.likeContainer[data.target] = data.userList;

    //삭제카운트 돌리기.
    setTimeout(() => {
      this.removeUserList(data);
    }, this.removeCount);
  }

  getUserList(data: {
    type: 'follower' | 'following' | 'like';
    target: string;
    searchString: string;
  }): userinfo[] | undefined {
    console.log(`get from ${data.type} conatiner, target is ${data.target}`);

    if (data.type === 'follower') {
      return this.followerContainer[data.target];
    }
    if (data.type === 'following') {
      return this.followingContainer[data.target];
    }
    return this.likeContainer[data.target];
  }

  removeUserList(data: {
    type: 'follower' | 'following' | 'like';
    target: string;
  }) {
    console.log(`remove from ${data.type} conatiner, target is ${data.target}`);

    if (data.type === 'follower') {
      delete this.followerContainer[data.target];
    }
    if (data.type === 'following') {
      delete this.followingContainer[data.target];
    }
    delete this.likeContainer[data.target];
  }
}

export const cacheManager = new CacheManager();
