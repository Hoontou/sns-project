import fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';

const server = fastify();

server.register(fastifyIO);

server.ready().then(() => {
  // we need to wait for the server to be ready, else `server.io` is undefined
  server.io.on('connection', (socket) => {
    console.log('connected');
  });
});

server.get('/', (req, rep) => {
  rep.send('hi');
});

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
