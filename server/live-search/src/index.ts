import fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import { SocketEx } from './common/interface';
import { searchUserOrHashtag } from './search.functions/user.hash.search';

const server = fastify();

server.register(fastifyIO);

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined
  server.io.on('connection', (socket: SocketEx) => {
    console.log('connected');

    socket.on('searchUserOrHashtag', (data: { searchString: string }) => {
      searchUserOrHashtag(data.searchString).then((result) => {
        return socket.emit('searchUserOrHashtagResult', result);
      });
    });

    socket.on('disconnecting', (reason) => {
      console.log(reason);
    });
  });
});

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`live-search on 4008:80`);
});
