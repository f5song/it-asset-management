import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/exception.service';
import { withPaging } from '../utils/pagination';

// helper: แปลง query sort=col:dir → { col, desc }
function parseSortParam(sort?: string): { col: string; desc: boolean } | undefined {
  if (!sort) return undefined;
  const [col, dir] = sort.split(':');
  if (!col) return undefined;
  return { col, desc: (dir || '').toLowerCase() === 'desc' };
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, risk, categoryId, isActive } = req.query;
    const sortParam = parseSortParam(typeof req.query.sort === 'string' ? req.query.sort : undefined);

    // ใช้ pagination 1-based จาก middleware
    const p = req.pagination!;
    const { items, total } = await svc.listExceptions({
      search: typeof search === 'string' ? search : undefined,
      risk: typeof risk === 'string' ? (risk as any) : undefined,
      categoryId: typeof categoryId === 'string' ? +categoryId : undefined,
      sort: sortParam,
      pageIndex: p.pageIndex0,  // service 0‑based
      pageSize: p.pageSize,
    });

    return res.json(withPaging(items, total, p.pageIndex0, p.pageSize));
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const row = await svc.getExceptionById(+req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function listAssignees(req: Request, res: Response, next: NextFunction) {
  try {
    const p = req.pagination!;
    const { items, total } = await svc.listAssigneesByException(+req.params.id, p.pageIndex0, p.pageSize);
    return res.json(withPaging(items, total, p.pageIndex0, p.pageSize));
  } catch (err) {
    next(err);
  }
}

export async function assign(req: Request, res: Response, next: NextFunction) {
  try {
    const { empCodes = [], assignedBy } = req.body || {};
    const result = await svc.assignExceptionToEmployees(+req.params.id, empCodes, assignedBy);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function revoke(req: Request, res: Response, next: NextFunction) {
  try {
    const { empCodes = [], revokedBy, reason } = req.body || {};
    const result = await svc.revokeAssignments(+req.params.id, empCodes, revokedBy, reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function simple(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? +req.query.limit : 10;
    const items = await svc.listExceptionsSimple(limit);
    res.json(items);
  } catch (err) {
    next(err);
  }
}