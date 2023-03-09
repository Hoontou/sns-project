import { IncomingHttpHeaders } from 'http';
import { Socket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket';

//알람 DTO 정의
export interface AlertDto {
  _id: string;
  userId: string;
  content: UploadContent | DeletePostContent;
} //타입과 result는 계속해서 추가.

type Upload = 'upload';
type DelPost = 'deletePost';
interface UploadContent {
  type: Upload; //유니온으로 나열할 예정.
  success: boolean;
  postId: string;
}
interface DeletePostContent {
  type: DelPost;
  success: boolean;
  postId: string;
}

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
}
