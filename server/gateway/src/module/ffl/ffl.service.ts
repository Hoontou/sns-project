import { Injectable, Logger } from '@nestjs/common';
import { AmqpService } from 'src/common/amqp/amqp.service';

@Injectable()
export class FflService {
  private logger = new Logger(FflService.name);
  constructor(private amqpService: AmqpService) {}
  async addFollow(body: { userTo: string; userFrom: string }) {
    this.amqpService.sendMsg('ffl', body, this.addFollow.name);
    this.amqpService.sendMsg('user', body, this.addFollow.name);
  }
}
