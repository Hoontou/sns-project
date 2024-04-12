import { Injectable } from '@nestjs/common';
import { UploadMessage } from 'sns-interfaces';
import { MetadataService } from '../metadata/metadata.service';
import { PostService } from '../post/post.service';
import { UserService } from '../user/user.service';

@Injectable()
export class UploadService {
  constructor(
    private metadataService: MetadataService,
    private postService: PostService,
    private userService: UserService,
  ) {}
  uploadPost(body: { uploadForm: UploadMessage }) {
    const form = body.uploadForm;
    this.metadataService.saveMetadata(form);
    this.postService.posting(form);
    this.userService.increasePostCount(form);

    return;
  }
  uploadUserImg(body: { uploadForm: { userId: string; img: string } }) {
    this.userService.changeImg(body.uploadForm);
    return;
  }
}
