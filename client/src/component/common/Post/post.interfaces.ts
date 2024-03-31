import { MetadataSchemaType } from 'sns-interfaces';
import { PostFooterContent } from 'sns-interfaces/client.interface';

export const emptyPostFooterContent: PostFooterContent = {
  userId: '',
  liked: false,
  username: '',
  img: '',
  _id: '',
  title: '',
  likesCount: 0,
  commentCount: 0,
};

export const emptyMetadata: MetadataSchemaType = {
  _id: '',
  userId: '',
  files: [''],
  createdAt: '',
};
