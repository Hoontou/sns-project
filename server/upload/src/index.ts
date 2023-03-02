import fastify from 'fastify';
import { rmDirer } from './common/rmdir';
//걍 폴더 날려버린다. 개굿 https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/remove.md
//Removes a file or directory. The directory can have contents. If the path does not exist, silently does nothing.
import { add_idToReq, uploadToLoacl } from './common/middleware';
import { client as azureClient } from './azure/azure.client';
import multer from 'fastify-multer';
import { uploadToAzure } from './azure/azure.storage';
import { MetadataDto, uploadRequest, AlertDto } from './common/interface'; //req 파라미터의 타입 명시를 해줘야함.
import type { FastifyCookieOptions } from '@fastify/cookie';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { crypter } from './common/crypter';
import { rabbitMQ } from './common/amqp';

const server = fastify();
// eslint-disable-next-line @typescript-eslint/no-var-requires
server.register(cookie, {} as FastifyCookieOptions);
server.register(multer.contentParser);
server.register(cors, {
  origin: true,
});

server.post(
  '/uploadfiles',
  { preHandler: [add_idToReq, uploadToLoacl] }, //순서대로 미들웨어 호출됨.
  async (req: uploadRequest, reply) => {
    const { comment } = JSON.parse(req.body.comment);
    const { alert_id } = JSON.parse(req.body.alert_id);
    //추후 알람 MSA에서 사용할 _id, 계획은 _id로 알람 삭제하면 게시물 post성공했다는 뜻.
    //로직 다 처리하고 알람 삭제해주면 됨
    const { userUuid } = JSON.parse(req.body.userUuid); //클라이언트에서 hoc해서 보내준 값이고 암호화 돼있음.
    const decUuid: string = crypter.decrypt(userUuid);
    const post_id: string = req._id;
    const postList: string[] = req.postList;
    console.log('start uploading');
    console.log(postList);
    console.log('======start azure upload======');
    await uploadToAzure(azureClient, postList, post_id);
    //주석만 없애면 정삭적 작동함. 지금은 돈나가니까 주석해놓음.
    console.log('======upload end======');
    const metadataForm: MetadataDto = {
      _id: post_id,
      userUuid: decUuid,
      files: postList,
      comment,
    };
    const alertFrom: AlertDto = {
      _id: alert_id,
      userUuid: decUuid,
      type: 'upload',
      content: {
        success: true,
        post_id,
      },
    };
    rabbitMQ.channel.sendToQueue(
      //메타데이터로 보낸다.
      'metadata',
      Buffer.from(JSON.stringify(metadataForm)),
    );
    rabbitMQ.channel.sendToQueue(
      //alert로 보낸다.
      'alert',
      Buffer.from(JSON.stringify(alertFrom)),
    );

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
