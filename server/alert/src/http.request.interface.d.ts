import { FastifyRequest } from 'fastify';

export interface GetUnreadAlertReq extends FastifyRequest {
  body: {
    userId: number;
    page: number;
  };
}
