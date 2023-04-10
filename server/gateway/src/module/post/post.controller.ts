import { Controller, Get, Req } from '@nestjs/common';

@Controller('post')
export class PostController {
  @Get('/hi')
  hi(@Req() req) {
    console.log(req.user);
  }
}
