import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { CocommentDto, CommentDto, PostDto } from './dto/post.dto';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  //from upload
  //need post_id to primary key, userUuid(작성자uuid) to foreign key
  //req: {post_id: post objectId, userId: userUuid}
  //which is PostDto, 발리데이션 파이프 통과 후
  //pgdb에 삽입.
  //이것은 업로드로부터 온 요청이니까 hoc 필요없음.
  //res: {success: boolean}
  @Post('/posting')
  posting(
    @Body(ValidationPipe) postDto: PostDto,
  ): Promise<{ success: boolean }> {
    return this.postService.posting(postDto);
  }

  @Post('/commenting')
  commenting(
    @Body(ValidationPipe) commentDto: CommentDto,
  ): Promise<{ success: boolean }> {
    return this.postService.commenting(commentDto);
  }

  // @Post('/cocommenting')
  // cocommenting(@Body(ValidationPipe) cocommentDto: CocommentDto) {
  //   return this.postService.cocommenting(cocommentDto);
  // }
}
