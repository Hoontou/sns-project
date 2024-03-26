import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { MetadataService } from './metadata.service';

@Controller('metadata')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  @Post('/getmetadatas')
  getMetadatas(@Body() body: { userId: string; page: number }) {
    return this.metadataService.getMetadatas(body);
  }

  @Post('/getMetadataWithPostFooter')
  getMetadataWithPostFooter(@Body() body: { postId: string }, @Req() req) {
    return this.metadataService.getMetadataWithPostFooter({
      postId: body.postId,
      userId: req.user.userId,
    });
  }

  @Post('/getMetadatasByPostId')
  getMetadatasByPostId(@Body() body: { _ids: string[] }, @Req() req) {
    return this.metadataService.getMetadatasByPostId(body);
  }
}
