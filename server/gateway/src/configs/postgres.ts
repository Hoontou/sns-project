import { Client } from 'pg';

class Postgres {
  public readonly client;
  constructor() {
    this.client = new Client({
      host: 'pgdb',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
    });
  }
}

export const pgdb = new Postgres();
