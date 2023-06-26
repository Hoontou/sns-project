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
}

export interface UserInfo {
  success: true;
  following: number;
  follower: number;
  postcount: number;
  img: string;
  introduce: string;
  username: string;
  followed: boolean;
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
