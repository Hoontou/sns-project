import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AlertService } from './alert.service';

@Controller('alert')
export class AlertController {
  constructor(private alertService: AlertService) {}

  @Post('/getUnreadAlert')
  async addFollow(@Body() body: { page: number }, @Req() req) {
    return this.alertService.getUnreadAlert({
      userId: req.user.userId,
      page: body.page,
    });
  }

  @Post('/readAlert')
  async readAlert(@Body() body: { alert_id: string }) {
    return this.alertService.readAlert(body);
  }
}
