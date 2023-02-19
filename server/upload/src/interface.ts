import { FastifyRequest } from 'fastify';

export interface uploadRequest extends FastifyRequest {
  uuid: string;
  count: number;
  body: { comment: string; alertUuid: string };
}
