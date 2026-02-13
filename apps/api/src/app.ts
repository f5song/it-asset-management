// src/app.ts
import express from 'express';
import { env } from './config/env';
import { sequelize } from './models';
import exceptionRoutes from './routes/exception.routes';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/error';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', async (_req, res) => {
    try {
      await sequelize.authenticate();
      res.json({ status: 'ok', db: 'ok', env: env.NODE_ENV });
    } catch {
      res.status(500).json({ status: 'error', db: 'down' });
    }
  });

  app.use('/exceptions', exceptionRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}