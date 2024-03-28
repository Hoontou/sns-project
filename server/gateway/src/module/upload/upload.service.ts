import { Injectable } from '@nestjs/common';
import { UploadMessage } from 'sns-interfaces';
import { MetadataService } from '../metadata/metadata.service';
import { PostService } from '../post/post.service';
import { UserRepository } from '../user/user.repo';

@Injectable()
export class UploadService {
  constructor(
    private metadataService: MetadataService,
    private postService: PostService,
    private userRepository: UserRepository,
  ) {}
  uploadPost(body: { uploadForm: UploadMessage }) {
    const form = body.uploadForm;
    this.metadataService.saveMetadata(form);
    this.postService.posting(form);
    this.userRepository.addPostCount(form);

    return;
  }
  uploadUserImg(body: { uploadForm: { userId: string; img: string } }) {
    this.userRepository.changeImg(body.uploadForm);
    return;
  }
}
