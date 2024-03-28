import { Body, Controller, Post } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadMessage } from 'sns-interfaces';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('/tst')
  tst(@Body() body) {
    console.log(body);
  }

  @Post('/post')
  uploadPost(@Body() body: { uploadForm: UploadMessage }) {
    return this.uploadService.uploadPost(body);
  }

  @Post('/userImg')
  uploadUserImg(@Body() body: { uploadForm: { userId: string; img: string } }) {
    return this.uploadService.uploadUserImg(body);
  }
}
