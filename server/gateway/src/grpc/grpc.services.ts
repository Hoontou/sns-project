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
  getUsernums({
    userId,
  }: {
    userId: string;
  }): Observable<{ follower: number; following: number; postcount: number }>;
}

export interface MetadataGrpcService {
  getMetadatas({ userId }: { userId: string }): Observable<MetadataDto[]>;
}

//이거 npm 업데이트 오류로 잠시만 여기두는거임.
interface GetMetadatasRes {
  metadatas: MetadataDto[];
}
