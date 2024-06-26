//--------------아래는 배포전 새로 등록한,

export interface MetadataSchemaType {
  _id: string;
  userId: string;
  files: string[];
  createdAt: string;
}

//------------------------------여기까지
//메타데이터 DTO 정의
export interface MetadataDto {
  id: string;
  userId: string;
  files: string[];
}
export interface MetadataDto_id {
  _id: string;
  userId: string;
  files: string[];
}

export interface SignInDto {
  email: string;
  password: string;
}
export interface SignUpDto extends SignInDto {
  username: string;
}
export interface AuthDto {
  accessToken: string;
  refresh: boolean;
}

export type AuthResultRes = AuthSuccess | AuthFail;
export interface AuthSuccess {
  success: true;
  userId: string;
  username: string;
  accessToken?: string;
}
export interface AuthFail {
  success: false;
  msg?: string;
}

// export type PostMessage = PostDto | CommentDto | CocommentDto;

// export interface PostDto {
//   type: 'PostDto';
//   content: {
//     postId: string;
//     userId: string | number | number; //작성자 id}
//   };
// }
// export interface CommentDto {
//   type: 'CommentDto';
//   content: {
//     comment: string;
//     userId: string | number | number; //작성자
//     postId: string; //부모 post id (objectid)
//   };
// }
// export interface CocommentDto {
//   type: 'CocommentDto';
//   content: {
//     cocomment: string;
//     userId: string | number;
//     commentId: number | string; //부모 comment id (int)
//   };
// }

export type Que =
  | 'alert'
  | 'metadata'
  | 'post'
  | 'ffl'
  | 'upload'
  | 'user'
  | 'gateway'
  | 'dm';
export interface AmqpMessage {
  fields: {
    exchange: Que;
    routingKey: string;
  };
  properties: {
    appId: Que;
    type: string;
  };
  content: JSON;
  //원래이거 Buffer인데 패키지가 없어서 안되는듯?
}

export interface UploadMessage {
  userId: string;
  postId: string;
  files: string[];
  title: string;
}

export interface GetCommentListReq {
  id: number;
  comment: string;
  likeCount: number;
  cocommentCount: number;
  createdAt: string;
}

export interface CommentItemContent {
  liked: boolean;
  commentId: number;
  comment: string;
  createdAt: string;
  userId: string | number;
  likesCount: number;
  cocommentCount: number;
  username: string;
  img: string;
  postId: string;
}

export type ReqUser =
  | {
      success: true;
      userId: string;
      username: string;
      introduceName?: string;
    }
  | { success: false };
