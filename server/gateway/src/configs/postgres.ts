import { Client } from 'pg';

const localPostgresConfig = {
  host: 'pgdb',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
};

const awsPostgresConfig = {
  host: process.env.AWS_POSTGRES_HOST,
  port: 5432,
  user: process.env.AWS_POSTGRES_USERNAME,
  password: process.env.AWS_POSTGRES_PASSWORD,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
};

class Postgres {
  public readonly client;
  constructor() {
    this.client = new Client(
      process.env.NODE_ENV ? localPostgresConfig : awsPostgresConfig,
    );
  }
}

export const pgdb = new Postgres();
