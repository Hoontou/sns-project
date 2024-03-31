import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SearchService } from './search.service';

@WebSocketGateway({ namespace: 'search', cors: { origin: '*' } })
export class SearchGateway implements OnGatewayConnection {
  private readonly logger = new Logger(SearchGateway.name);
  constructor(private searchService: SearchService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    this.logger.debug('search socket connected');

    // this.logger.debug('search socket connected');

    socket.on('searchUserOrHashtag', (data: { searchString: string }) => {
      this.searchService
        .searchUserOrHashtag(data.searchString)
        .then((result) => {
          // this.logger.debug('live search result');
          // this.logger.debug(result);
          return socket.emit('searchUserOrHashtagResult', result);
        });
    });
  }
}
