import { Observable } from 'rxjs';
import { AuthResultRes, SignInDto } from 'sns-interfaces';

export interface UserGrpcService {
  signIn(SignInReq: SignInDto): Observable<AuthResultRes>;
}
