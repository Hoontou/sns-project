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
  getUserinfo({ userId }: { userId: string }): Observable<{
    follower: number;
    following: number;
    postcount: number;
    username: string;
    img: string;
    introduce: string;
  }>;
  getUsernameWithImg({
    userId,
  }: {
    userId: number;
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
}

export interface MetadataGrpcService {
  getMetadatas(data: {
    userId: string;
    page: number;
  }): Observable<MetadataDto & { createdAt: string }[]>;

  getMetadatasLast3Day(data: {
    userIds: string[];
    page: number;
  }): Observable<{ metadatas: MetadataDto[] }>;
}

export interface FflGrpcService {
  checkFollowed({
    userId,
    myId,
  }: {
    userId: string;
    myId: string;
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
}
