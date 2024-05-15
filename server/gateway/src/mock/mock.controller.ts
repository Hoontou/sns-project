import { Controller, Get } from '@nestjs/common';
import { MockDataService } from './mock.service';

@Controller('mock')
export class MockDataController {
  constructor(private mockDataService: MockDataService) {}

  @Get('/hi')
  hi() {
    return 'hi';
  }

  //회원가입
  @Get('/insertMockUser')
  insertMockUser() {
    return this.mockDataService.insertMockUser();
  }
  //postging
  @Get('/insertMockPost')
  insertMockPost() {
    return this.mockDataService.insertMockPost();
  }
  //팔로우 추가
  @Get('/addMockFollow')
  addMockFollow() {
    return this.mockDataService.addMockFollow();
  }
  //댓글
  @Get('/addMockComments')
  addMockComments() {
    return this.mockDataService.addMockComments();
  }
  //댓글에 좋아요
  @Get('/addMockCommentLikes')
  addMockCommentLikes() {
    return this.mockDataService.addMockCommentLikes();
  }
  //게시물에 좋아요
  @Get('/addMockLikes')
  addMockLikes() {
    return this.mockDataService.addMockLikes();
  }

  @Get('/updateMockUserInfo')
  updateMockUserInfo() {
    return this.mockDataService.updateMockUserInfo();
  }

  // @Get('/addMockFollowToTest123456')
  // addMockFollowToTest123456() {
  //   return this.mockDataService.addMockFollowToTest123456();
  // }
}
