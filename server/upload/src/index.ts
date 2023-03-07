import fastify from 'fastify';
import { rmDirer } from './common/tools/rmdir';
import { add_idToReq, uploadToLoacl } from './common/middleware';
import { client as azureClient } from './azure/azure.client';
import multer from 'fastify-multer';
import { uploadToAzure } from './azure/azure.storage';
import { UploadRequest, ParserInterface } from './common/interface'; //req 파라미터의 타입 명시를 해줘야함.
import type { FastifyCookieOptions } from '@fastify/cookie';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { rabbitMQ } from './common/amqp';
import { reqParser } from './common/tools/req.parser';

const server = fastify();
// eslint-disable-next-line @typescript-eslint/no-var-requires
server.register(cookie, {} as FastifyCookieOptions);
server.register(multer.contentParser);
server.register(cors, {
  origin: true,
});

//from Client
server.post(
  '/uploadfiles',
  { preHandler: [add_idToReq, uploadToLoacl] }, //순서대로 미들웨어 호출됨.
  async (req: UploadRequest, reply) => {
    const { post_id, postList, metadataForm, alertForm }: ParserInterface =
      reqParser(req);

    console.log('start uploading');
    console.log(postList);
    //console.log('======start azure upload======');
    //await uploadToAzure(azureClient, postList, post_id); //주석만 없애면 정삭적 작동함. 지금은 돈나가니까 주석
    //console.log('======upload end======');

    //여기에 이제 메인백의 post컨트롤러로 post_id랑 title, userId 날려야함.
    rabbitMQ.sendMsg('metadata', metadataForm);
    rabbitMQ.sendMsg('alert', alertForm);

    rmDirer.counter();
    //현재 5카운트마다 삭제시킴. 근데 이거 오류날 가능성 있어서 잘 체크해야함
    //빠르게 요청클릭해도 오류 없긴한데...
    //지금 azure 업로드를 await 걸지말지 모르는 상태이고,
    //await안걸면 한번한번마다 삭제하는게 맞는거 같은데
    //뭐가 성능상 좋은지 고민하고 테스트 해봐야할듯.
  },
);
//https://snsupload.blob.core.windows.net/915123b6-3100-4c28/915123b6-3100-4c28.0.png
//위 주소로 사진 볼수있음. 메타데이터에 보낼 정보임. string 핸들링해서 메타데이터로 넘기자.
//azure컨테이너주소/_id/_id.몇번째.확장자 형식임.

// server.get('/cootest', (req, reply) => {
//   console.log(req.cookies);
//   // axios.get('http://main-back:4000/user').then((res) => console.log(res.data));
//   return { success: true };
// }); hoc 엑시오스 테스트코드. 근데 쿠키가 안날라가서 폐기. hoc는 클라이언트에서 진행하는걸로..

server.listen({ host: '0.0.0.0', port: 80 }, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  rabbitMQ.initialize(['metadata', 'alert']);
  console.log(`Server listening at ${address}`);
});
