import { Observable } from 'rxjs';
import {
  AuthDto,
  AuthResultRes,
  MetadataDto,
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
  getUsername({ userId }: { userId: string }): Observable<{ username: string }>;
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
}

export interface PostGrpcService {
  getPostnums({
    postId,
  }: {
    postId: string;
  }): Observable<{ likesCount: number; commentCount: number }>;
}
