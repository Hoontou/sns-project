import { Body, Controller, Post, Req } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { ExReq } from '../auth/auth.middleware';
import { MetadataDto } from './repository/metadata.collection';

@Controller('metadata')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  @Post('/getmetadatas')
  getMetadatas(@Body() body: { userId: string; page: number }) {
    return this.metadataService.getMetadatas(body);
  }

  @Post('/getMetadatasOrderByDate')
  getMetadatasOrderBy(
    @Body() body: { by: 'last' | 'first'; page: number },
  ): Promise<{
    metadatas: MetadataDto[];
  }> {
    return this.metadataService.getMetadatasOrderByDate(body);
  }

  @Post('/getMetadatasOrderByLikes')
  getMetadatasOrderByLikes(@Body() body: { page: number }) {
    return this.metadataService.getMetadatasOrderByLikes(body);
  }

  @Post('/getMetadataWithPostFooter')
  getMetadataWithPostFooter(
    @Body() body: { postId: string },
    @Req() req: ExReq,
  ) {
    return this.metadataService.getMetadataWithPostFooter({
      postId: body.postId,
      userId: req.user.userId,
    });
  }

  @Post('/getMetadatasByPostId')
  getMetadatasByPostId(@Body() body: { _ids: string[] }) {
    return this.metadataService.getMetadatasByPostId(body);
  }

  @Post('/getMyCollections')
  getMyCollection(@Body() body: { page: number }, @Req() req: ExReq) {
    return this.metadataService.getMyCollection({
      ...body,
      userId: req.user.userId,
    });
  }
}
