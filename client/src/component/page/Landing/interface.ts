export interface LandingContent {
  userId: string;
  liked: boolean;
  username: string;
  img: string;
  id: string;
  title: string;
  likesCount: number;
  commentCount: number;
  files: string[];
  createdAt: string;
}

export const defaultLandingContent: LandingContent = {
  userId: '',
  liked: false,
  username: '',
  img: '',
  id: '',
  title: '',
  likesCount: 0,
  commentCount: 0,
  files: [],
  createdAt: '',
};
