import { Observable } from 'rxjs';
import { AuthDto, AuthResultRes, SignInDto, SignUpDto } from 'sns-interfaces';

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
