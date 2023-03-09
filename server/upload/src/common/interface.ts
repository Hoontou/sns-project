import { FastifyRequest } from 'fastify';

//ts에서 fastify req 인자 사용하려면 이렇게해야함
export interface UploadRequest extends FastifyRequest {
  _id: string;
  count: number;
  postList: string[];
  body: { title: string; alert_id: string; userId: string };
}

export interface ParserInterface {
  postId: string;
  postList: string[];
  metadataForm: MetadataDto;
  alertForm: AlertDto;
  postingForm: PostingDto;
}

export interface PostingDto {
  userId: string;
  postId: string;
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
  content: UploadContent;
} //타입과 content는 계속해서 추가.

interface UploadContent {
  type: Upload;
  success: boolean;
  postId: string;
}
type Upload = 'upload';
