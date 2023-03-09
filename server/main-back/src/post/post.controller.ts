import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CocommentDto, CommentDto, PostDto } from './dto/post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('/hi')
  hi() {
    console.log('hi');
    return 'hi';
  }

  //from upload
  //need post_id to primary key, userUuid(작성자uuid) to foreign key
  //req: {postId: post objectId, userId: userUuid}
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

  //req: {
  //  "postId": "640402bdcdb83edbebf41",
  //  "userId": "1",
  //  "comment": "테스트입니다"
  //}
  @Post('/commenting')
  commenting(
    @Body(ValidationPipe) commentDto: CommentDto,
  ): Promise<{ success: boolean }> {
    return this.postService.commenting(commentDto);
  }

  // req:  {
  //     "commentId": "13",
  //     "userId": "1",
  //     "cocomment": "테스트입니다"
  // }
  @Post('/cocommenting')
  cocommenting(
    @Body(ValidationPipe) cocommentDto: CocommentDto,
  ): Promise<{ success: boolean }> {
    return this.postService.cocommenting(cocommentDto);
  }

  //req: { "postId": "1"}
  @Delete('/delpost')
  @UseGuards(AuthGuard())
  delPost(@Req() req): Promise<void> {
    return this.postService.delPost(req);
  }
}
