// export interface AlertServer {
//   userId: string;
//   socket: Socket;
//   connAt: Date;
// }

import { Socket } from 'socket.io';

export class SocketManager {
  private container: Map<number, Socket | undefined>;
  constructor() {
    this.container = new Map();
    //빈번한 수정에는 Map이 그냥 객체보다 성능좋다고 한다. MDN피셜임.
  }

  getSock(userId) {
    return this.container.get(userId);
  }

  setSock(userId: number, socket: Socket) {
    return this.container.set(userId, socket);
  } //컨테이너에 {Id: {obj}, Id2: {obj2},,,} 이렇게 넣는다.

  disconnSock(userId: number) {
    return this.container.delete(userId);
  }

  checkManager() {
    setInterval(() => {
      console.log('checking socket container --------');
      console.log(this.container);
      console.log('---------------------------');
    }, 5000);
  }
}

export const socketManager = new SocketManager();
