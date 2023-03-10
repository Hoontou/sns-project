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

  //여기 포스트 작업 오기 전에 클라이언트에서 따로 user controller로 hoc진행하고
  //userid까지 Dto에 넣어서 보내주기로 할거임.
  //근데 그러면 클라이언트와 서버와의 연결이 두번?
  //아니면 Dto 발리데이션에서 유저정보는 삭제하고,
  //가드통과해서 유저정보를 내가 Form에 넣어줄까?
  //서버와의 연결 두번.... 나중가면 비용이 많이들것이고...
  //아니면 그냥 클라이언트의 로컬스토리지의 userid를 가져와서 날려도 되는데...
  //이것은 유저가 로컬 스토리지를 안건드렸다고 가정하고 진행하는 것이고..
  //내가 Form에 넣어주려면 매우 귀찮음.
  //유저가 로컬스토리지 악의적으로 안건드렸다고 가정하고, 클라이언트가 Dto에 담아서
  //날리는게 제일 편할듯?
  //리액트 useEff써서 hoc를 하면 편하긴 함.

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

  //req: { "postId": "1"}, 가드 통과하면 req.user에 정보가 옴.
  //지금 del post하면 게시물 삭제 알림 날리는데
  //알람 굳이 안날리려면 req.user를 파싱할 필요는 없다.
  //하지만 게시물 삭제는 중요한 부분이니 가드 통과는 해야할듯?
  @Delete('/delpost')
  @UseGuards(AuthGuard())
  delPost(@Req() req): Promise<void> {
    return this.postService.delPost(req);
  }
}
