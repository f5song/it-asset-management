import 'dotenv/config';

export const env = {
  PORT: +(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',

  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: +(process.env.DB_PORT ?? 5432),
  DB_USER: process.env.DB_USER ?? 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_NAME: process.env.DB_NAME ?? 'app_db',

  DB_POOL_MAX: +(process.env.DB_POOL_MAX ?? 10),
  DB_SSL: (process.env.DB_SSL ?? 'false') === 'true',

  TZ: process.env.TZ ?? '+07:00',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
};