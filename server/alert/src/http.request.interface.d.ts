import { FastifyRequest } from 'fastify';

export interface GetAlertReq extends FastifyRequest {
  body: {
    userId: number;
    page: number;
  };
}

export interface CheckHasNewAlertReq extends FastifyRequest {
  body: {
    userId: string;
  };
}

export interface ReadAlertReq extends FastifyRequest {
  body: {
    alert_id: string;
  };
}
