import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/exception.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      search,
      risk,
      categoryId,
      isActive,
      sortCol,
      sortDesc,
      pageIndex = '0',
      pageSize = '20',
    } = req.query;

    const result = await svc.listExceptions({
      search: typeof search === 'string' ? search : undefined,
      risk: typeof risk === 'string' ? (risk as any) : undefined,
      categoryId: typeof categoryId === 'string' ? +categoryId : undefined,
      isActive:
        typeof isActive !== 'undefined'
          ? String(isActive) === 'true'
          : undefined,
      sort:
        typeof sortCol === 'string'
          ? { col: sortCol, desc: String(sortDesc) === 'true' }
          : undefined,
      pageIndex: Number(pageIndex),
      pageSize: Number(pageSize),
    });

    res.json(result);
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
    const { pageIndex = '0', pageSize = '20' } = req.query;
    const result = await svc.listAssigneesByException(+req.params.id, +pageIndex, +pageSize);
    res.json(result);
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
