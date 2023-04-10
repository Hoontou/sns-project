import { Observable } from 'rxjs';
import { AuthDto, AuthResultRes, SignInDto } from 'sns-interfaces';

export interface UserGrpcService {
  signIn(SignInReq: SignInDto): Observable<AuthResultRes>;
  auth(AuthReq: AuthDto): Observable<AuthResultRes>;
}
