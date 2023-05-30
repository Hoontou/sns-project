import { PostContent } from 'sns-interfaces';

export interface PostFooterContent extends PostContent {
  liked: boolean;
  username: string;
  img: string;
}

export const emptyPostFooterContent: PostFooterContent = {
  liked: false,
  username: '',
  img: '',
  id: '',
  title: '',
  likesCount: 0,
  commentCount: 0,
};
