import { FastifyRequest } from 'fastify';

//ts에서 fastify req 인자 사용하려면 이렇게해야함
export interface uploadRequest extends FastifyRequest {
  uuid: string;
  count: number;
  nameList: string[];
  body: { comment: string; alertUuid: string; userUuid: string };
}

export interface MetadataDto {
  userUuid: string;
  postUuid: string;
  files: string[];
  comment: string;
}
