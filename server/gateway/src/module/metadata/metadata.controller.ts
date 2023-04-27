import { Body, Controller, Post } from '@nestjs/common';
import { MetadataService } from './metadata.service';

@Controller('metadata')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  @Post('/getmetadatas')
  getMetadatas(@Body() body: { userId: string }) {
    return this.metadataService.getMetadatas(body.userId);
  }
}
