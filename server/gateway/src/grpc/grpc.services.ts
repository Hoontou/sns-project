import { Observable } from 'rxjs';
import {
  AuthDto,
  AuthResultRes,
  MetadataDto,
  SignInDto,
  SignUpDto,
} from 'sns-interfaces';
import { CocommentContent, PostContent } from 'sns-interfaces/client.interface';

export interface AuthGrpcService {
  signIn(SignInReq: SignInDto): Observable<AuthResultRes>;
  signUp(SignUpReq: SignUpDto): Observable<{ success: boolean; msg?: string }>;
  auth(AuthReq: AuthDto): Observable<AuthResultRes>;
}

export interface UserGrpcService {
  getUserinfoById({ userId }: { userId: string }): Observable<{
    userId: string;
    follower: number;
    following: number;
    postcount: number;
    username: string;
    img: string;
    introduce: string;
    introduceName: string;
  }>;
  getUserinfoByUsername({ username }: { username: string }): Observable<{
    userId: string;
    follower: number;
    following: number;
    postcount: number;
    username: string;
    img: string;
    introduce: string;
    introduceName: string;
  }>;
  getUsernameWithImg({
    userId,
  }: {
    userId: string;
  }): Observable<{ username: string; img: string }>;
  getUsernameWithImgList({ userIds }: { userIds: string[] }): Observable<{
    userList: { username: string; img: string; userId: number }[];
  }>;
  changeUsername({
    userId,
    username,
  }: {
    userId: string;
    username: string;
  }): Observable<{ success: boolean; exist?: boolean }>;
  changeIntro({
    userId,
    intro,
  }: {
    userId: string;
    intro: string;
  }): Observable<{ success: boolean }>;
  changeIntroduceName({
    userId,
    introduceName,
  }: {
    userId: string;
    introduceName: string;
  }): Observable<{ success: boolean }>;
}

export interface MetadataGrpcService {
  getMetadatas(data: { userId: string; page: number }): Observable<{
    metadatas: (MetadataDto & { createdAt: string })[] | undefined;
  }>;

  getMetadatasLast3Day(data: {
    userIds: string[];
    page: number;
  }): Observable<{ metadatas: MetadataDto[] | undefined }>;

  getMetadatasByPostId(data: {
    _ids: string[];
  }): Observable<{ metadatas: MetadataDto[] }>;
}

export interface FflGrpcService {
  checkFollowed({
    userTo,
    userFrom,
  }: {
    userTo: string;
    userFrom: string;
  }): Observable<{ followed: boolean }>;

  checkLiked({
    userId,
    postId,
  }: {
    userId: string;
    postId: string;
  }): Observable<{ liked: boolean }>;

  getUserIds({
    id,
    type,
  }: {
    id: string;
    type: 'like' | 'follower' | 'following';
  }): Observable<{ userIds: string[] }>;
  getCommentLiked({
    commentIdList,
    userId,
  }: {
    commentIdList: number[];
    userId: string;
  }): Observable<{ commentLikedList: boolean[] }>;
  getCocommentLiked(data: {
    cocommentIdList: number[];
    userId: string;
  }): Observable<{ cocommentLikedList: boolean[] }>;
}

export interface PostGrpcService {
  getPost({ postId }: { postId: string }): Observable<PostContent>;
  getCommentList({
    postId,
    page,
  }: {
    postId: string;
    page: number;
  }): Observable<{
    comments: {
      commentId: number;
      comment: string;
      createdAt: string;
      userId: number | string;
      likesCount: number;
      cocommentCount: number;
      username: string;
      img: string;
    }[];
  }>;
  getCocommentList(data: { commentId: number; page: number }): Observable<{
    cocomments: CocommentContent[];
  }>;

  getPostsIdsByHashtag(data: {
    hashtag: string;
    page: number;
  }): Observable<{ _ids: string[] }>;
}
