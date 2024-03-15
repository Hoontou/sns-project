import { IncomingHttpHeaders } from 'http';
import { Socket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket';

//소켓정보의 헤더에 커스텀헤더 타입 정의를 위해.
//이렇게 힘들게 했는데 뭔가 더 쉬운방법이 있을거같은데..
export interface SocketEx extends Socket {
  handshake: handshakeEx;
}
interface handshakeEx extends Handshake {
  headers: IncomingHttpHeadersEx;
}
interface IncomingHttpHeadersEx extends IncomingHttpHeaders {
  userid: string;
  location: string;
}
