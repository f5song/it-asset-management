// employees.controller.ts
import type { Request, Response } from 'express';
import { pool } from '../../db/pool';
import { parsePaging } from '../../utils/pagination';

export async function searchEmployees(req: Request, res: Response) {
  const q = req.query.q?.toString() ?? '';
  const { pageIndex, pageSize } = parsePaging(req.query);
  const where = q ? `WHERE lower(name_th) LIKE lower('%' || $1 || '%') 
                        OR lower(surname_th) LIKE lower('%' || $1 || '%')
                        OR emp_code LIKE '%' || $1 || '%'` : '';
  const params = q ? [q] : [];
  const itemsSql = `
    SELECT emp_code, name_th, surname_th, department_name
    FROM public."07_employee"
    ${where}
    ORDER BY emp_code ASC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM public."07_employee" ${where}
  `;
  const [itemsRes, countRes] = await Promise.all([
    pool.query(itemsSql, [...params, pageSize, pageIndex * pageSize]),
    pool.query(countSql, params)
  ]);
  res.json({ items: itemsRes.rows, total: countRes.rows[0].total as number });
}