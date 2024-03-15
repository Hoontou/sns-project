import { Socket } from 'socket.io';

// export interface AlertServer {
//   userId: string;
//   socket: Socket;
//   connAt: Date;
// }

export class UserLocationManager {
  private container: Map<number, number | 'inbox' | undefined>;
  constructor() {
    this.container = new Map();
    //빈번한 수정에는 Map이 그냥 객체보다 성능좋다고 한다. MDN피셜임.
  }

  enterChatRoom(userId: number, chatRoomId: number): void {
    this.container.set(userId, chatRoomId);
  }
  enterInbox(userId: number) {
    this.container.set(userId, 'inbox');
  }

  exitDirect(userId: number): void {
    this.container.set(userId, undefined);
  } //객체를 아예 지워버리면 뭔가 비용이 많이발생할것같음.
  //false로 해놓고 나중에 한꺼번에 false인것들 지워버리게 하자.
  //conn, disconn이 빈번한데 그때마다 지우는것보다 업데이트로.

  getWhereIsUser(userId: number) {
    return this.container.get(userId); //sock이 false, 또는 객체가 아예 없든지 둘다 false 리턴함.
  }

  checkManager() {
    setInterval(() => {
      console.log('checking chat room container --------');
      console.log(this.container);
      console.log('---------------------------');
    }, 5000);
  }
}

export const userLocationManager = new UserLocationManager();
