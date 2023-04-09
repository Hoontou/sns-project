import { Inject, Injectable, OnModuleInit, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { SignInDto } from 'sns-interfaces';
import { UserGrpcService } from 'src/grpc/grpc.interfaces';
import { Observable } from 'rxjs';

@Injectable()
export class UserService implements OnModuleInit {
  private userGrpcService: UserGrpcService;
  constructor(@Inject('user') private client: ClientGrpc) {}
  onModuleInit() {
    this.userGrpcService =
      this.client.getService<UserGrpcService>('UserService');
  }

  signIn(signInDto: SignInDto) {
    const result = this.userGrpcService.signIn(signInDto);
    result.subscribe(
      (x) => console.log(x),
      (err) => console.error(err),
      () => console.log('complete'),
    );
  }
}
