export const appConfig = {
  port: Number(process.env.PORT ?? 3000),
  prefix: process.env.API_PREFIX ?? 'api',
  env: process.env.NODE_ENV ?? 'development',
};
