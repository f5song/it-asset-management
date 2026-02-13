import { Sequelize } from 'sequelize';
import { env } from './env';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,

  logging: false,

  pool: {
    max: env.DB_POOL_MAX,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  dialectOptions: {
    ...(env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {})
  },

  timezone: env.TZ,
});