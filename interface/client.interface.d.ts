export interface PostContent {
  id: string;
  title: string;
  likesCount: number;
  commentCount: number;
}

export interface PostFooterContent extends PostContent {
  liked: boolean;
  username: string;
  img: string;
  userId: string;
}

export interface UserInfo {
  userId: string;
  following: number;
  follower: number;
  postcount: number;
  img: string;
  introduce: string;
  username: string;
  followed: boolean;
  introduceName: string;
}

export interface CocommentContent {
  cocommentId: number;
  img: string;
  userId: string;
  username: string;
  createdAt: string;
  cocomment: string;
  liked: boolean;
  likesCount: number;
}
