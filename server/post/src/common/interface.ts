//알람 DTO 정의
export interface AlertDto {
  _id: string;
  userId: string;
  content: UploadContent | DeletePostContent;
} //타입과 result는 계속해서 추가.

type Upload = 'upload';
type DelPost = 'deletePost';
interface UploadContent {
  type: Upload; //유니온으로 나열할 예정.
  success: boolean;
  postId: string;
}
interface DeletePostContent {
  type: DelPost;
  success: boolean;
  postId: string;
}
