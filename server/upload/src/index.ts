import fastify from 'fastify';

const server = fastify();

server.get('/hi', async (request, reply) => {
  console.log('hi');
  return 'pong\n';
});

server.listen({ host: '0.0.0.0', port: 4001 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
