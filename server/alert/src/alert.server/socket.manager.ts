import { Socket } from 'socket.io';

// export interface AlertServer {
//   userUuid: string;
//   socket: Socket;
//   connAt: Date;
// }

class SocketManager {
  private container;
  constructor() {
    this.container = {};
  }

  setSock(userUuid: string, socket: Socket): void {
    this.container[userUuid] = socket;
  } //컨테이너에 {uuid: {obj}, uuid2: {obj2},,,} 이렇게 넣는다.

  disconnSock(userUuid: string): void {
    this.container[userUuid] = false;
  } //객체를 아예 지워버리면 뭔가 비용이 많이발생할것같음.
  //false로 해놓고 나중에 한꺼번에 false인것들 지워버리게 하자.

  getSocket(userUuid: string): Socket | false | undefined {
    const sock: Socket | false | undefined = this.container[userUuid];
    return sock; //sock이 false, 또는 객체가 아예 없든지 둘다 false 리턴함.
  }

  delSocket(): void {
    for (const key in this.container) {
      const socket: Socket | false = this.container[key];
      if (socket) {
        delete this.container[key];
      }
    } //이거를 전역에 인터벌 시키던지 해서 주기적으로 돌려버리자.
  }
}

export const socketManager = new SocketManager();
