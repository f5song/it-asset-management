import type { Request, Response } from 'express';
import { parsePaging, parseSort } from '../../utils/pagination';
import {
  listExceptions,
  getExceptionById,
  listAssigneesByException,
  assignExceptionToEmployees,
  revokeAssignments,
  listExceptionsSimple
} from './exceptions.service';

export async function getExceptions(req: Request, res: Response) {
  const { pageIndex, pageSize } = parsePaging(req.query);
  const { col, desc } = parseSort(req.query, ['exception_id','name','risk_level','created_at'], 'exception_id:desc');

  const out = await listExceptions({
    search: req.query.search?.toString(),
    risk: (req.query.risk as any) ?? undefined,
    categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
    isActive: typeof req.query.isActive === 'string' ? req.query.isActive === 'true' : undefined,
    sort: { col, desc },
    pageIndex,
    pageSize
  });
  res.json(out);
}

export async function getException(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = await getExceptionById(id);
  if (!data) return res.status(404).json({ error: 'Exception not found' });
  res.json(data);
}

export async function getExceptionAssignees(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { pageIndex, pageSize } = parsePaging(req.query);
  const out = await listAssigneesByException(id, pageIndex, pageSize);
  res.json(out);
}

export async function postAssign(req: Request, res: Response) {
  const id = Number(req.params.id);
  const body = req.body as { empCodes?: string[]; assignedBy?: string };
  if (!Array.isArray(body.empCodes) || body.empCodes.length === 0) {
    return res.status(400).json({ error: 'empCodes[] is required' });
  }
  const out = await assignExceptionToEmployees(id, body.empCodes, body.assignedBy);
  res.status(201).json(out);
}

export async function postRevoke(req: Request, res: Response) {
  const id = Number(req.params.id);
  const body = req.body as { empCodes?: string[]; revokedBy?: string; reason?: string };
  if (!Array.isArray(body.empCodes) || body.empCodes.length === 0) {
    return res.status(400).json({ error: 'empCodes[] is required' });
  }
  const out = await revokeAssignments(id, body.empCodes, body.revokedBy, body.reason);
  res.json(out);
}


export async function getExceptionsSimple(req: Request, res: Response) {
  // ป้องกันค่า limit เพี้ยน ๆ และกันยิงหนักเกินไป
  const raw = Number(req.query.limit);
  const limit = Number.isFinite(raw) ? Math.max(1, Math.min(100, raw)) : 10;

  try {
    const items = await listExceptionsSimple(limit);
    res.json({ items, count: items.length });
  } catch (e: any) {
    res.status(500).json({ error: 'failed to fetch simple exceptions', detail: e?.message });
  }
}
