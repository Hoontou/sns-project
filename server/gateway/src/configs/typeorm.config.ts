import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const localTypeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'pgdb',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};

export const awsTypeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  keepConnectionAlive: true,
  host: process.env.AWS_POSTGRES_HOST,
  port: 5432,
  username: process.env.AWS_POSTGRES_USERNAME,
  password: process.env.AWS_POSTGRES_PASSWORD,
  database: 'postgres',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
};
