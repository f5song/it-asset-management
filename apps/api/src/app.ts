// src/app.ts
import express from 'express';
import cors from 'cors';                 // ✅ เพิ่ม
import cookieParser from 'cookie-parser';// ✅ เพิ่ม
import { env } from './config/env';
import { sequelize } from './models';
import exceptionRoutes from './routes/exception.routes';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/error';

export function createApp() {
  const app = express();

  // ✅ ถ้าอยู่หลัง Nginx/Ingress/Cloudflare แนะนำให้เปิด เพื่อให้ Secure cookie ทำงาน
  app.set('trust proxy', 1);

  // ✅ CORS (ต้องมาก่อน route อื่น ๆ)
  // รองรับได้ทั้งค่าเดียวหรือหลายค่า (คั่นด้วย ,)
  const allowedOrigins = (env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  app.use(cors({
    origin: (origin, cb) => {
      // อนุญาตกรณีไม่มี origin (เช่น health check, curl, SSR บางแบบ)
      if (!origin) return cb(null, true);
      // ถ้าไม่ได้กำหนด allowedOrigins → ปล่อยทุก origin (ไม่แนะนำใน prod)
      if (allowedOrigins.length === 0) return cb(null, true);
      // ตรวจว่าอยู่ในรายการที่อนุญาต
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: Origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }));

  // (ถ้าต้องการตอบสนอง preflight เร็ว ๆ)
  app.options('*', cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  }));

  // ✅ Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser()); // ถ้าใช้คุกกี้ auth/session

  // Health check
  app.get('/health', async (_req, res) => {
    try {
      await sequelize.authenticate();
      res.json({ status: 'ok', db: 'ok', env: env.NODE_ENV });
    } catch {
      res.status(500).json({ status: 'error', db: 'down' });
    }
  });

  // Simple logger
  app.use((req, _res, next) => { console.log('[API]', req.method, req.url); next(); });

  // Business routes
  app.use('/exceptions', exceptionRoutes);

  // Not found & error handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
}