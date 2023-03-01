import { FastifyRequest } from 'fastify';

//ts에서 fastify req 인자 사용하려면 이렇게해야함
export interface uploadRequest extends FastifyRequest {
  _id: string;
  count: number;
  postList: string[];
  body: { comment: string; alert_id: string; userUuid: string };
}

export interface MetadataDto {
  _id: string;
  userUuid: string;
  files: string[];
  comment: string;
}

export interface AlertDto {
  _id: string;
  userUuid: string;
  type: Upload;
  content: UploadResult;
} //타입과 result는 계속해서 추가.

interface UploadResult {
  success: boolean;
  post_id: string;
}
type Upload = 'upload';
