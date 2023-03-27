import { FastifyRequest } from 'fastify';
import { MetadataDto, AlertDto, PostDto } from 'sns-interfaces';

//ts에서 fastify req 인자 사용하려면 이렇게해야함
export interface UploadRequest extends FastifyRequest {
  postId: string;
  postList: string[];
  body: { title: string; alert_id: string; userId: string };
  files;
  bufferList: Buffer[];
}
