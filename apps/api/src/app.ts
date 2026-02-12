// app.ts
import express from 'express';
import { errorHandler } from './middlewares/error';
import { notFound } from './middlewares/notFound';
import { exceptionsRouter } from './modules/exceptions/exceptions.routes';
import { employeesRouter } from './modules/employees/employees.routes';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/exceptions', exceptionsRouter);
  app.use('/api/employees', employeesRouter);

  app.use(notFound);
  app.use(errorHandler);

  

  return app;
}