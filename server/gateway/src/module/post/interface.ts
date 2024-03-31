export type HandleUserTagReqBody = {
  //유저태그 추출할 텍스트
  text: string;
  type: 'post' | 'comment' | 'cocomment';
  whereId: number | string;
  userId: number;
};

export type AddLikeType = AddLikePost | AddLikeComment | AddLikeCocomment;
export interface AddLikePost {
  postId: string;
  type: 'post';
}
export interface AddLikeComment {
  commentId: number;
  type: 'comment';
}
export interface AddLikeCocomment {
  cocommentId: number;
  type: 'cocomment';
}
