//알람 DTO 정의
export interface AlertDto {
  _id?: string;
  userId: number | string;
  content: AlertContentUnion;
} //타입과 content는 계속해서 추가.

export interface AlertDocType {
  _id?: string;
  userId: number;
  content: AlertContentUnion;
  // content: AlertContentUnion & { userId: number[] };
  createdAt: Date;
  read: boolean;
}

export interface UploadAlertDto {
  _id?: string;
  userId: number | string;
  content: UploadAlert;
} //타입과 content는 계속해서 추가.

export type AlertContentUnion =
  | CommentAlert
  | CocommentAlert
  | FollowAlert
  | TagAlert
  | LikeAlert;

export interface UploadAlert {
  type: 'upload';
  success: boolean;
  postId: string;
}

//누가 어느포스트에 어떤댓글을 달았나
interface CommentAlert {
  type: 'comment';
  postId: string;
  commentId: number;
  userId: number | string;
}

//누가 어떤댓글에 어떤대댓을 달았나
interface CocommentAlert {
  type: 'cocomment';
  commentId: number;
  cocommentId: number;
  userId: number | string;
}

//누가 나를 팔로우했나
interface FollowAlert {
  type: 'follow';
  userId: number | string; //팔로우 누른 사람들, 최대 세명? 두명까지 생각중
}

//누가 나를 어디에 태그했나
interface TagAlert {
  type: 'tag';
  where: 'comment' | 'cocomment' | 'post';
  whereId: string | number;
  userId: number | string;
}

//누가 어떤게시물에 좋아요 했나
interface LikeAlert {
  type: 'like';
  userId: number | string; //좋아요 누른 사람들, 최대 세명? 두명까지 생각중
  postId: string;
}

export interface UserTagAlertReqForm {
  usernames: string[];
  content: {
    type: 'tag';
    where: 'post' | 'comment' | 'cocomment';
    whereId: string | number;
    userId: number;
  };
}
