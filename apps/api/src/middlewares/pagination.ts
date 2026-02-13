import { Request, Response, NextFunction } from 'express';
import { normalize1BasedPaging } from '../utils/pagination';

// ประกาศ type เพิ่มให้ req.pagination ใช้ได้ใน TypeScript
declare module 'express-serve-static-core' {
  interface Request {
    pagination?: {
      pageIndex0: number;
      pageIndex1: number;
      pageSize: number;
      offset: number;
      limit: number;
    };
  }
}

/**
 * ใช้กับ route ที่ต้องการ 1-based pagination
 * รองรับ query ?pageIndex=1&pageSize=20
 */
export function pagination1Based(opts?: { pageSizeDefault?: number; pageSizeMax?: number }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { pageIndex, pageSize } = req.query;

    const normalized = normalize1BasedPaging({
      pageIndex1: typeof pageIndex === 'string' ? pageIndex : undefined,
      pageSize: typeof pageSize === 'string' ? pageSize : undefined,
      pageSizeDefault: opts?.pageSizeDefault ?? 20,
      pageSizeMax: opts?.pageSizeMax ?? 100,
    });

    req.pagination = normalized;
    next();
  };
}