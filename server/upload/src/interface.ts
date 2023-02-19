import { FastifyRequest } from 'fastify';

export interface uploadRequest extends FastifyRequest {
  uuid: string;
  count: number;
  nameList: string[];
  body: { comment: string; alertUuid: string };
}
