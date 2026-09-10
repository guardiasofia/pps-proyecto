export const envConfig = {
  jwtSecret: process.env.JWT_SECRET ?? 'pps-secret-key',
  port: Number(process.env.PORT ?? 3000),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'pps_db',
  },
};
