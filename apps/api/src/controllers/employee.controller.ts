// src/controllers/employee.controller.ts
import { Request, Response, NextFunction } from 'express';
// ⚠️ ตรวจชื่อไฟล์ service ให้ตรง: ถ้าไฟล์ชื่อ employees.service.ts ให้ import ให้ถูก
import * as svc from '../services/employee.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    // ✅ ใช้ค่า 1-based จาก middleware pagination1Based (req.pagination)
    const { pageIndex1 = 1, pageSize = 10 } = req.pagination ?? {};
    const q = req.query as Record<string, string | undefined>;

    const sort =
      q.sortBy
        ? { col: String(q.sortBy), desc: String(q.sortOrder ?? 'asc').toLowerCase() === 'desc' }
        : undefined;

    // ✅ ส่ง 1-based เข้า service (เราได้แก้ service ให้รับ { page, pageSize } แล้ว)
    const data = await svc.listEmployees({
      page: Number(pageIndex1),                      // 1-based
      pageSize: Number(pageSize),
      search: q.search ?? '',
      status: q.status as any,                       // "Active" | "Resigned" | undefined
      type: q.type ?? undefined,                     // department_name
      sort,
      // ถ้ามีฟิลเตอร์พิเศษ
      excludeAssignedForExceptionId: q.excludeAssignedForExceptionId
        ? Number(q.excludeAssignedForExceptionId)
        : undefined,
    });

    // ถ้า service ใช้ withPaging แล้ว จะมี meta 1-based กลับมาใน data อยู่แล้ว:
    // { items, total, pageIndex(1-based), pageSize, pageCount, hasPrev, hasNext }
    // คุณสามารถส่งออกทั้งก้อนเลย หรือ map ชื่อฟิลด์ตามที่ FE ต้องการ

    return res.json({
      items: data.items,
      totalCount: data.total,
      page: data.pageIndex ?? Number(pageIndex1),    // 1-based
      pageSize: data.pageSize ?? Number(pageSize),
      pageCount: data.pageCount,
      hasPrev: data.hasPrev ?? (Number(pageIndex1) > 1),
      hasNext: data.hasNext ?? (Number(pageIndex1) * Number(pageSize) < Number(data.total)),
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