import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SearchGateway implements OnGatewayConnection {
  private readonly logger = new Logger(SearchGateway.name);

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {}
}
