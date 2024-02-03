import { FastifyRequest } from 'fastify';

export interface GetUnreadAlertReq extends FastifyRequest {
  body: {
    userId: number;
    page: number;
  };
}

export interface ReadAlertReq extends FastifyRequest {
  body: {
    alert_id: string;
  };
}
