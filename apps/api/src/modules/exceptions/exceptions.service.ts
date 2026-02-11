import { pool } from '../../db/pool';
import { whereBuilder } from '../../utils/sql';

export type ListExceptionsParams = {
  search?: string;
  risk?: 'Low'|'Medium'|'High';
  categoryId?: number;
  isActive?: boolean;
  sort?: { col: string; desc: boolean };
  pageIndex: number;
  pageSize: number;
};

export async function listExceptions(p: ListExceptionsParams) {
  const w = whereBuilder();
  if (p.search) {
    // contains search (ไม่มี pg_trgm ก็ใช้ ILIKE ได้ แต่ช้าเมื่อข้อมูลเยอะ)
    w.add(`lower(e.name) LIKE lower('%' || $1 || '%')`, p.search);
  }
  if (p.risk) w.add(`e.risk_level = $1`, p.risk);
  if (p.categoryId) w.add(`e.category_id = $1`, p.categoryId);
  if (typeof p.isActive === 'boolean') w.add(`e.is_active = $1`, p.isActive);

  const where = w.build();

  // อนุญาตให้ sort เฉพาะคอลัมน์ที่กำหนด
  const col = p.sort?.col ?? 'exception_id';
  const dir = p.sort?.desc ? 'DESC' : 'ASC';
  const orderBy = `ORDER BY ${col} ${dir}`;

  const base = `
    FROM public.exception_list e
    LEFT JOIN (
      SELECT exception_id,
             COUNT(*) FILTER (WHERE status = 'active') AS assignees_active,
             MAX(assigned_at) AS last_assigned_at
      FROM public.exception_assignment
      GROUP BY exception_id
    ) a ON a.exception_id = e.exception_id
    LEFT JOIN (
      SELECT exception_id, COUNT(*) AS tickets_count
      FROM public.exception_ticket_map
      GROUP BY exception_id
    ) t ON t.exception_id = e.exception_id
    ${where.sql}
  `;

  const sqlItems = `
    SELECT e.exception_id, e.code, e.name, e.risk_level, e.category_id, e.is_active,
           e.created_at,
           COALESCE(a.assignees_active,0) AS assignees_active,
           COALESCE(t.tickets_count,0) AS tickets_count,
           a.last_assigned_at
    ${base}
    ${orderBy}
    LIMIT $${where.params.length + 1} OFFSET $${where.params.length + 2}
  `;

  const sqlCount = `SELECT COUNT(*)::int AS total ${base}`;

  const client = await pool.connect();
  try {
    const [itemsRes, countRes] = await Promise.all([
      client.query(sqlItems, [...where.params, p.pageSize, p.pageIndex * p.pageSize]),
      client.query(sqlCount, where.params)
    ]);
    return { items: itemsRes.rows, total: countRes.rows[0].total as number };
  } finally {
    client.release();
  }
}

export async function getExceptionById(exceptionId: number) {
  const sql = `
    SELECT e.*, 
           COALESCE(a.assignees_active,0) AS assignees_active,
           COALESCE(t.tickets_count,0) AS tickets_count
    FROM public.exception_list e
    LEFT JOIN (
      SELECT exception_id,
             COUNT(*) FILTER (WHERE status='active') AS assignees_active
      FROM public.exception_assignment
      GROUP BY exception_id
    ) a ON a.exception_id = e.exception_id
    LEFT JOIN (
      SELECT exception_id, COUNT(*) AS tickets_count
      FROM public.exception_ticket_map
      GROUP BY exception_id
    ) t ON t.exception_id = e.exception_id
    WHERE e.exception_id = $1
    LIMIT 1;
  `;
  const res = await pool.query(sql, [exceptionId]);
  return res.rows[0] ?? null;
}

export async function listAssigneesByException(exceptionId: number, pageIndex: number, pageSize: number) {
  const sqlItems = `
    SELECT x.assignment_id, x.emp_code, x.status, x.valid_from, x.valid_to,
           x.assigned_at, x.assigned_by, x.revoked_at, x.revoked_by,
           emp.name_th, emp.surname_th, emp.department_name
    FROM public.exception_assignment x
    JOIN public."07_employee" emp ON emp.emp_code = x.emp_code
    WHERE x.exception_id = $1
    ORDER BY x.assigned_at DESC
    LIMIT $2 OFFSET $3
  `;
  const sqlCount = `
    SELECT COUNT(*)::int AS total
    FROM public.exception_assignment
    WHERE exception_id = $1
  `;
  const [itemsRes, countRes] = await Promise.all([
    pool.query(sqlItems, [exceptionId, pageSize, pageIndex * pageSize]),
    pool.query(sqlCount, [exceptionId])
  ]);
  return { items: itemsRes.rows, total: countRes.rows[0].total as number };
}

export async function assignExceptionToEmployees(
  exceptionId: number,
  empCodes: string[],
  assignedBy?: string
) {
  if (!empCodes.length) return { inserted: 0 };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // ใช้ ON CONFLICT (unique partial index: uq_exception_assignment_active) กันซ้ำ active
    const sql = `
      INSERT INTO public.exception_assignment (exception_id, emp_code, status, assigned_by)
      SELECT $1, unnest($2::varchar[]), 'active', $3
      ON CONFLICT ON CONSTRAINT uq_exception_assignment_active DO NOTHING
      RETURNING assignment_id
    `;
    const res = await client.query(sql, [exceptionId, empCodes, assignedBy ?? null]);
    await client.query('COMMIT');
    return { inserted: res.rowCount ?? 0, assignmentIds: res.rows.map(r => r.assignment_id) };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function revokeAssignments(
  exceptionId: number,
  empCodes: string[],
  revokedBy?: string,
  reason?: string
) {
  if (!empCodes.length) return { updated: 0 };
  const sql = `
    UPDATE public.exception_assignment
    SET status = 'revoked',
        revoked_at = now(),
        revoked_by = $3,
        revoke_reason = COALESCE($4, revoke_reason)
    WHERE exception_id = $1
      AND emp_code = ANY($2::varchar[])
      AND status = 'active'
  `;
  const res = await pool.query(sql, [exceptionId, empCodes, revokedBy ?? null, reason ?? null]);
  return { updated: res.rowCount ?? 0 };
}