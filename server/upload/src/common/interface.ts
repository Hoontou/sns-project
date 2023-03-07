import { FastifyRequest } from 'fastify';

//ts에서 fastify req 인자 사용하려면 이렇게해야함
export interface UploadRequest extends FastifyRequest {
  _id: string;
  count: number;
  postList: string[];
  body: { title: string; alert_id: string; userId: string };
}

export interface ParserInterface {
  post_id: string;
  postList: string[];
  metadataForm: MetadataDto;
  alertForm: AlertDto;
}

export interface MetadataDto {
  _id: string;
  userId: string;
  files: string[];
  title: string;
  createdAt: Date;
}

export interface AlertDto {
  _id: string;
  userId: string;
  type: Upload;
  content: UploadContent;
} //타입과 content는 계속해서 추가.

interface UploadContent {
  success: boolean;
  post_id: string;
}
type Upload = 'upload';
