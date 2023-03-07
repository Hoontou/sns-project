import { FastifyRequest } from 'fastify';

export interface MetadataRequest extends FastifyRequest {
  // _id: string;
  // count: number;
  // postList: string[];
  body: { userId: string };
}
