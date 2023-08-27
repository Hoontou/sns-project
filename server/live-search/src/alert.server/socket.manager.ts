import { Socket } from 'socket.io';

// export interface AlertServer {
//   userId: string;
//   socket: Socket;
//   connAt: Date;
// }

class SocketManager {
  private container;
  constructor() {
    this.container = new Map();
    //빈번한 수정에는 Map이 그냥 객체보다 성능좋다고 한다. MDN피셜임.
  }

  setSock(userId: string, socket: Socket): void {
    this.container.set(userId, socket);
  } //컨테이너에 {Id: {obj}, Id2: {obj2},,,} 이렇게 넣는다.

  disconnSock(userId: string): void {
    this.container.set(userId, false);
  } //객체를 아예 지워버리면 뭔가 비용이 많이발생할것같음.
  //false로 해놓고 나중에 한꺼번에 false인것들 지워버리게 하자.
  //conn, disconn이 빈번한데 그때마다 지우는것보다 업데이트로.

  getSocket(userId: string): Socket | false | undefined {
    const sock: Socket | false | undefined = this.container.get(userId);
    return sock; //sock이 false, 또는 객체가 아예 없든지 둘다 false 리턴함.
  }

  delSocket(): void {
    for (const key in this.container) {
      const socket: Socket | false = this.container.get(key);
      if (!socket) {
        //연결 없는 소켓은 삭제
        this.container.delete(key);
      }
    } //이거를 전역에 인터벌 시키던지 해서 주기적으로 돌려버리자.
  }
}

export const socketManager = new SocketManager();
