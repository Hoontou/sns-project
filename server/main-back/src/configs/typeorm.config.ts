import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'pgdb',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'sns',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};
