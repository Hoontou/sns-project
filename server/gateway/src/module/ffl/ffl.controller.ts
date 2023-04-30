import { Body, Controller, Post } from '@nestjs/common';
import { FflService } from './ffl.service';

@Controller('ffl')
export class FflController {
  constructor(private fflService: FflService) {}

  @Post('/addfollow')
  async addFollow(@Body() body: { userTo: string; userFrom: string }) {
    return this.fflService.addFollow(body);
  }

  @Post('/removefollow')
  async removeFollow(@Body() body: { userTo: string; userFrom: string }) {
    return this.fflService.removeFollow(body);
  }
}
