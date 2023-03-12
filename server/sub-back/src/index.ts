import fastify from 'fastify';

const server = fastify();

server.get('/ping', (req, reply) => {
  return 'pong';
});

server.listen({ host: '0.0.0.0', port: 80 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`sub-back on 4001:80`);
});
