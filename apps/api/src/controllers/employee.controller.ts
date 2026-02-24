// src/controllers/employee.controller.ts
import { Request, Response, NextFunction } from 'express';
// ⚠️ ตรวจชื่อไฟล์ service ให้ตรง: ถ้าไฟล์ชื่อ employees.service.ts ให้ import ให้ถูก
import * as svc from '../services/employee.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { pageIndex1 = 1, pageSize = 10 } = req.pagination ?? {}; // จาก middleware 1-based
    const q = req.query as Record<string, string | undefined>;

    const sort = q.sortBy
      ? { col: String(q.sortBy), desc: String(q.sortOrder ?? 'asc').toLowerCase() === 'desc' }
      : undefined;

    const data = await svc.listEmployees({
      page: Number(pageIndex1),
      pageSize: Number(pageSize),
      search: q.search ?? '',
      status: q.status as any,
      type: q.type ?? undefined,
      sort,
      //   ส่ง exceptionId ที่ต้อง "exclude active" ใน exception นั้น
      excludeAssignedForExceptionId: q.excludeAssignedForExceptionId
        ? Number(q.excludeAssignedForExceptionId)
        : undefined,
    });

    return res.json({
      items: data.items,
      totalCount: data.total,
      page: data.pageIndex ?? Number(pageIndex1),
      pageSize: data.pageSize ?? Number(pageSize),
      pageCount: data.pageCount,
      hasPrev: data.hasPrev,
      hasNext: data.hasNext,
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const row = await svc.getEmployeeById(id);
    if (!row) return res.status(404).json({ message: `Employee ${id} not found` });
    return res.json(row);
  } catch (err) {
    next(err);
  }
}