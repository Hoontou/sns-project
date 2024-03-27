export class UserLocationManager {
  private container: Map<number, number | 'inbox' | undefined>;
  constructor() {
    this.container = new Map();
    //빈번한 수정에는 Map이 그냥 객체보다 성능좋다고 한다. MDN피셜임.
  }

  enterChatRoom(userId: number, chatRoomId: number) {
    return this.container.set(userId, chatRoomId);
  }
  enterInbox(userId: number) {
    return this.container.set(userId, 'inbox');
  }

  exitDirect(userId: number) {
    return this.container.delete(userId);
  }

  getUserLocation(userId: number) {
    return this.container.get(userId);
  }

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
