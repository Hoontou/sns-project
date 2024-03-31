import { CommentItemContent } from 'sns-interfaces';
import { CocommentContent } from 'sns-interfaces/client.interface';

export type SubmitForm = SubmitCocoForm | SubmitCommentForm;
export interface SubmitCommentForm {
  type: 'comment';
  postId: string;
  postOwnerUserId: string;
}
export interface SubmitCocoForm {
  type: 'cocomment';
  commentId: number;
  targetUsername: string;
  commentOwnerUserId: string | number;
  index: number;
}

export const defaultCommentItemContent: CommentItemContent = {
  postId: '',
  liked: false,
  commentId: 0,
  comment: '',
  createdAt: '',
  userId: '',
  likesCount: 0,
  cocommentCount: 0,
  username: '',
  img: '',
};

export const defaultCocommentItemContent: CocommentContent = {
  commentId: 0,
  cocommentId: 0,
  img: '',
  username: '',
  cocomment: '',
  userId: '',
  liked: false,
  createdAt: '',
  likesCount: 0,
};

export interface CommentItems extends CommentItemContent {
  cocomments: CocommentContent[];
}
