import { Client } from 'pg';
export const pgClient = new Client({
  host: 'pgdb',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
});
