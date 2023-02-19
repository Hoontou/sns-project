import fastify from 'fastify';
import multer from 'fastify-multer';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({ dest: 'files/' });
const server = fastify();
server.register(multer.contentParser);

//여기서 file은 클라이언트에서 적은 키값, 4개이상 들어오면 status 413 날라간다.
//클라이언트에서 4개까지만 컷해서 보내주고 있음 지금.
const cpUpload = upload.fields([{ name: 'file', maxCount: 4 }]);
server.post('/uploadfiles', { preHandler: cpUpload }, (request, reply) => {
  const uuid = uuidv4();
  console.log(request);
});

server.listen({ host: '0.0.0.0', port: 4001 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
