import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { DmService } from './dm.service';

@Controller('dm')
export class DmController {
  constructor(private dmService: DmService) {}
}
