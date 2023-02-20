import fastify from 'fastify';
import { remove as fsRemove } from 'fs-extra'; //fs보다 진화된? 라이브러리, remove는 async방식임.
//걍 폴더 날려버린다. 개굿 https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/remove.md
//Removes a file or directory. The directory can have contents. If the path does not exist, silently does nothing.
import { addUuidToReq, cpUpload } from './middleware';
import { client as azureClient } from './azure.client';
import multer from 'fastify-multer';
import { uploadToAzure } from './azure.storage'; //REST API req인자 사용을 위해서 이렇게 해야함.
import { uploadRequest } from './interface'; //req 파라미터의 타입 명시를 해줘야함.

const server = fastify();

server.register(multer.contentParser); //multer로 로컬에 저장하는 미들웨어 등록

//여기서 file은 클라이언트에서 적은 키값, 4개이상 들어오면 status 413 날라간다.
//클라이언트에서 4개까지만 컷해서 보내주고 있음 지금.
//메인 로직
server.post(
  '/uploadfiles',
  { preHandler: [addUuidToReq, cpUpload] }, //uuid생성 미들웨어 먼저 호출.
  async (req: uploadRequest, reply) => {
    const { comment } = JSON.parse(req.body.comment);
    const { alertUuid } = JSON.parse(req.body.alertUuid);
    //추후 알람 MSA에서 사용할 uuid, 계획은 uuid로 알람 삭제하면 게시물 post성공했다는 뜻.
    //로직 다 처리하고 알람 삭제해주면 됨
    const postUuid: string = req.uuid; //post식별할 uuid
    const postCount: number = req.count + 1; //저장할땐 0부터 했는데 이제 1더해주자
    const postList: string[] = req.nameList;
    console.log('start uploading');
    console.log(postList);
    //console.log('======azure status======');
    //await uploadToAzure(azureClient, postList, postUuid);
    //주석만 없애면 정삭적 작동함. 지금은 돈나가니까 주석해놓음.
    //console.log('======upload end======');
    // fsRemove(`./files/${postUuid}`, () => {
    //   console.log('Folder Deleted');
    // }); 개발할때는 이거 주석처리 해서 파일 제대로 들어가는지 확인.
  },
);
//https://snsupload.blob.core.windows.net/915123b6-3100-4c28-9438-eb0d21ad0993/915123b6-3100-4c28-9438-eb0d21ad0993.0.png
//위 주소로 사진 볼수있음. 메타데이터에 보낼 정보임. string 핸들링해서 메타데이터로 넘기자.
//azure컨테이너주소/uuid/uuid.몇번째.확장자 형식임.
server.listen({ host: '0.0.0.0', port: 4001 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
