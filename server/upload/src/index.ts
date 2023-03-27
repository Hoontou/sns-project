import fastify from 'fastify';
import { preParser, uploadToMemory } from './common/middleware';
import { client as azureClient } from './azure/azure.client';
import multer from 'fastify-multer';
import { uploadToAzure } from './azure/azure.storage';
import { UploadRequest } from './common/interface'; //req 파라미터의 타입 명시를 해줘야함.
import type { FastifyCookieOptions } from '@fastify/cookie';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { rabbitMQ } from './common/amqp';
import { reqParser } from './common/tools/req.parser';
import { channel } from 'diagnostics_channel';

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
  { preHandler: [uploadToMemory, preParser] }, //순서대로 미들웨어 호출됨.
  async (req: UploadRequest, reply) => {
    // azure에 업로드
    // 주석만 없애면 정삭적 작동함. 지금은 돈나가니까 주석
    // 진행상황 콘솔출력은 함수안에 다 해놨음
    try {
      await uploadToAzure(
        azureClient,
        req.bufferList,
        req.postList,
        req.postId,
      );
    } catch {
      return;
    }

    //업로드 끝난 후 메세지 뿌린다.
    console.log('broadcasting to MSA');
    reqParser(req); //req 파싱한 후 메세지 전송까지해준다. 에러처리 필요안할듯?
  },
);
//https://snsupload.blob.core.windows.net/${postId}/0.png
//위 주소로 사진 볼수있음. 메타데이터에 보낼 정보임. string 핸들링해서 메타데이터로 넘기자.
//azure컨테이너주소/_id/몇번째.확장자 형식임.

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
  rabbitMQ.initialize([]);
  console.log(`upload on 4002:80`);
});
