import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AlertService } from './alert.service';
import { ExReq } from '../auth/auth.middleware';

@Controller('alert')
export class AlertController {
  constructor(private alertService: AlertService) {}

  @Get('/checkHasNewAlert')
  async checkHasNewAlert(@Req() req: ExReq) {
    return this.alertService.checkHasNewAlert({
      userId: req.user.userId,
    });
  }

  @Post('/getUnreadAlert')
  async getUnreadAlert(@Body() body: { page: number }, @Req() req: ExReq) {
    return this.alertService.getUnreadAlert({
      userId: req.user.userId,
      page: body.page,
    });
  }

  @Post('/getAllAlert')
  async getAllAlert(@Body() body: { page: number }, @Req() req: ExReq) {
    return this.alertService.getAllAlert({
      userId: req.user.userId,
      page: body.page,
    });
  }

  @Post('/readAlert')
  async readAlert(@Body() body: { alert_id: string }) {
    return this.alertService.readAlert(body);
  }
}
