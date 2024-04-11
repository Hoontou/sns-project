import { Injectable } from '@nestjs/common';

@Injectable()
export class StateManager {
  private container: Map<number, string> = new Map();

  setState(userId, objId) {
    return this.container.set(userId, objId);
  }

  getState(userId) {
    return this.container.get(userId);
  }

  deleteState(userId) {
    return this.container.delete(userId);
  }
}
