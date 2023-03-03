import { FastifyRequest } from 'fastify';

export interface metadataRequest extends FastifyRequest {
  // _id: string;
  // count: number;
  // postList: string[];
  body: { userUuid: string };
}
