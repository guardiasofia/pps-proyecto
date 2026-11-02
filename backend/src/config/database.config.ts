import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isProduction = process.env.NODE_ENV === 'production';
const required = (name: string, fallback?: string) => {
  const value = process.env[name] ?? (isProduction ? undefined : fallback);
  if (!value) throw new Error(`La variable ${name} es obligatoria`);
  return value;
};

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: required('DB_HOST', 'localhost'),
  port: Number(process.env.DB_PORT ?? 5432),
  username: required('DB_USERNAME', 'pps_user'),
  password: required('DB_PASSWORD', 'pps_password'),
  database: required('DB_NAME', 'pps_db'),
  ssl: process.env.DB_SSL === 'true',
  autoLoadEntities: true,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};
