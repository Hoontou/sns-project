import { Observable } from 'rxjs';
import {
  AuthDto,
  AuthResultRes,
  MetadataDto,
  PostContent,
  SignInDto,
  SignUpDto,
} from 'sns-interfaces';

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
}

export interface MetadataGrpcService {
  getMetadatas({ userId }: { userId: string }): Observable<MetadataDto[]>;
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
}

export interface PostGrpcService {
  getPost({ postId }: { postId: string }): Observable<PostContent>;
}
