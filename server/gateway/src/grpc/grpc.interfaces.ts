import { Observable } from 'rxjs';
import { AuthDto, AuthResultRes, SignInDto, SignUpDto } from 'sns-interfaces';

export interface UserGrpcService {
  signIn(SignInReq: SignInDto): Observable<AuthResultRes>;
  signUp(SignUpReq: SignUpDto): Observable<{ success: boolean; msg?: string }>;
  auth(AuthReq: AuthDto): Observable<AuthResultRes>;
}
