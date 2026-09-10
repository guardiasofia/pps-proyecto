import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'pps_user',
  password: process.env.DB_PASSWORD ?? 'pps_password',
  database: process.env.DB_NAME ?? 'pps_db',
  autoLoadEntities: true,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};
