import { CommentItemContent } from 'sns-interfaces';
import { CocommentContent } from './CommentItem';

export type SubmitForm = SubmitCocoForm | SubmitCommentForm;
export interface SubmitCommentForm {
  type: 'comment';
  postId: string;
}
export interface SubmitCocoForm {
  type: 'cocomment';
  commentId: number;
  targetUsername: string;
  index: number;
}

export const defaultCommentItemContent: CommentItemContent = {
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
