export interface MetadataDto {
  _id: string;
  userId: string;
  files: string[];
  title: string;
  createdAt: Date;
}

//알람 DTO 정의
export interface AlertDto {
  _id: string;
  userId: string;
  content: AlertContentUnion;
} //타입과 content는 계속해서 추가.

export type AlertContentUnion = UploadContent | DeletePostContent;
export type Upload = 'upload';
export type DelPost = 'deletePost';
export interface UploadContent {
  type: Upload;
  success: boolean;
  postId: string;
}
export interface DeletePostContent {
  type: DelPost;
  success: boolean;
  postId: string;
}

export interface SignInDto {
  email: string;
  password: string;
}
export interface SignUpDto extends SignInDto {
  username: string;
}

export interface UserInfoResponse {
  success: boolean;
  userId?: string;
  username?: string;
  accessToken?: string;
}

export interface PostDto {
  postId: string;
  userId: string | number; //작성자 id
}

export interface CommentDto {
  comment: string;
  userId: string | number; //작성자
  postId: string; //부모 post id (objectid)
}

export interface CocommentDto {
  cocomment: string;
  userId: string;
  commentId: number | string; //부모 comment id (int)
}
