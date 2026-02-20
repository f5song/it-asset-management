// src/middlewares/pagination.ts
import { Request, Response, NextFunction } from 'express';
import { normalize1BasedPaging } from '../utils/pagination';

// เพิ่ม type ให้ req.pagination ใช้งานได้
declare module 'express-serve-static-core' {
  interface Request {
    pagination?: {
      pageIndex0: number;
      pageIndex1: number; // 1-based
      pageSize: number;
      offset: number;
      limit: number;
    };
  }
}

/**
 * ใช้กับ route ที่ต้องการ 1-based pagination
 * ✅ รองรับ query: ?page=1&pageSize=20 (1-based เท่านั้น)
 */
export function pagination1Based(opts?: { pageSizeDefault?: number; pageSizeMax?: number }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { page, pageSize } = req.query;

    const normalized = normalize1BasedPaging({
      pageIndex1: typeof page === 'string' ? page : undefined,           // ✅ อ่าน page
      pageSize: typeof pageSize === 'string' ? pageSize : undefined,     // ✅ อ่าน pageSize
      pageSizeDefault: opts?.pageSizeDefault ?? 20,
      pageSizeMax: opts?.pageSizeMax ?? 100,
    });

    req.pagination = normalized;
    next();
  };
}