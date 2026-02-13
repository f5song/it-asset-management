// src/services/exception.service.ts
import { Op, fn, literal, where as sqlWhere } from 'sequelize';
import type { FindAndCountOptions } from 'sequelize';
import {
  sequelize,
  ExceptionList,
  ExceptionAssignment,
  // ExceptionTicketMap, // ถ้ายังไม่ใช้สามารถคอมเมนต์ไว้ได้
  Employees,
} from '../models';

// ------------------------------
// Types
// ------------------------------
export type ListExceptionsParams = {
  search?: string;
  risk?: 'Low' | 'Medium' | 'High';
  categoryId?: number;
  isActive?: boolean;
  sort?: { col: string; desc: boolean };
  pageIndex: number;
  pageSize: number;
};

// ------------------------------
// Sorting helpers
//   - คอลัมน์จริง: ใช้ชื่อคอลัมน์ตรง ๆ (เสถียรกว่า)
//   - คอลัมน์คำนวณ: ใช้ literal
// ------------------------------
const PLAIN_SORT_COLUMNS = new Set([
  'exception_id',
  'code',
  'name',
  'risk_level',
  'category_id',
  'is_active',
  'created_at',
  'updated_at',
]);

const LITERAL_SORT_MAP: Record<string, string> = {
  assignees_active: `(
    SELECT COUNT(*)
    FROM public.exception_assignment x
    WHERE x.exception_id = "ExceptionList"."exception_id"
      AND x.status = 'active'
  )`,
  last_assigned_at: `(
    SELECT MAX(assigned_at)
    FROM public.exception_assignment x
    WHERE x.exception_id = "ExceptionList"."exception_id"
  )`,
  tickets_count: `(
    SELECT COUNT(*)
    FROM public.exception_ticket_map t
    WHERE t.exception_id = "ExceptionList"."exception_id"
  )`,
};

// ------------------------------
// List with filters/sort/pagination
// ------------------------------
export async function listExceptions(p: ListExceptionsParams) {
  const where: any = {};
  if (p.search && p.search.trim() !== '') {
    where.name = { [Op.iLike]: `%${p.search.trim()}%` };
  }
  if (p.risk) where.risk_level = p.risk;
  if (p.categoryId) where.category_id = p.categoryId;
  if (typeof p.isActive === 'boolean') where.is_active = p.isActive;

  const sortKey = p.sort?.col ?? 'exception_id';
  const sortDir = p.sort?.desc ? 'DESC' : 'ASC';

  // เลือก attributes ให้ได้รายละเอียดใกล้เคียง /exceptions/:id
  const attributes: any = [
    'exception_id',
    'code',
    'name',
    'description',  // <-- ลบออกได้ถ้า schema ไม่มี
    'risk_level',
    'category_id',
    'is_active',
    'created_at',
    'created_by',   // <-- ลบออกได้ถ้า schema ไม่มี
    'updated_at',   // <-- ลบออกได้ถ้า schema ไม่มี
    'updated_by',   // <-- ลบออกได้ถ้า schema ไม่มี
    [literal(LITERAL_SORT_MAP.assignees_active), 'assignees_active'],
    [literal(LITERAL_SORT_MAP.last_assigned_at), 'last_assigned_at'],
    [literal(LITERAL_SORT_MAP.tickets_count), 'tickets_count'],
  ];

  // คำนวณ order: คอลัมน์จริง vs literal
  let order: FindAndCountOptions['order'];
  if (PLAIN_SORT_COLUMNS.has(sortKey)) {
    order = [[sortKey, sortDir]];
  } else if (LITERAL_SORT_MAP[sortKey]) {
    order = [literal(`${LITERAL_SORT_MAP[sortKey]} ${sortDir}`)] as any;
  } else {
    order = [['exception_id', 'ASC']];
  }

  const baseOptions: FindAndCountOptions = {
    where,
    attributes,
    order,
    limit: p.pageSize,
    offset: p.pageIndex * p.pageSize,
    raw: true,
    // ไม่ใส่ subQuery:false เพื่อหลีกเลี่ยงพฤติกรรมแปลกบางเคสกับ limit/offset
  };

  const result = await ExceptionList.findAndCountAll(baseOptions);

  // กัน edge case: total > 0 แต่ items ว่าง → fallback order/offset
  if ((result?.count ?? 0) > 0 && (result?.rows?.length ?? 0) === 0) {
    const retry = await ExceptionList.findAndCountAll({
      ...baseOptions,
      order: [['exception_id', 'ASC']],
      offset: 0,
    });
    return { items: retry.rows as any[], total: Number(retry.count) };
  }

  return { items: result.rows as any[], total: Number(result.count) };
}

// ------------------------------
// Get by id (รวมคอลัมน์คำนวณ)
// ------------------------------
export async function getExceptionById(exceptionId: number) {
  const row = await ExceptionList.findOne({
    where: { exception_id: exceptionId },
    attributes: {
      include: [
        [literal(LITERAL_SORT_MAP.assignees_active), 'assignees_active'],
        [literal(LITERAL_SORT_MAP.tickets_count), 'tickets_count'],
      ],
    },
    raw: true,
  });

  return (row as any) ?? null;
}

// ------------------------------
// List assignees for exception
// ------------------------------
// src/services/exception.service.ts (เฉพาะฟังก์ชันนี้)
export async function listAssigneesByException(
  exceptionId: number,
  pageIndex: number,
  pageSize: number,
) {
  // เงื่อนไขหลัก
  const baseWhere: any = { exception_id: exceptionId };

  // หากต้องการ "ต้องมี employee" จริง ๆ ใช้ EXISTS ใน where
  const mustHaveEmployee = literal(`
    EXISTS (
      SELECT 1
      FROM public."07_employee" emp
      WHERE emp.emp_code = "ExceptionAssignment"."emp_code"
    )
  `);

  // นับด้วย where เดียวกัน (รวม EXISTS ให้สอดคล้องกับ rows)
  const total = await ExceptionAssignment.count({
    where: {
      ...baseWhere,
      [Op.and]: [sqlWhere(literal('true'), mustHaveEmployee)],
    },
  });

  // ป้องกันหน้าเกิน (safe paging)
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safeIndex = Math.min(Math.max(0, pageIndex), Math.max(0, pageCount - 1));
  const offset = safeIndex * pageSize;

  // ดึง rows ด้วย LEFT JOIN (required:false) เพราะเราบังคับ EXISTS ไว้ใน where แล้ว
  const rows = await ExceptionAssignment.findAll({
    where: {
      ...baseWhere,
      [Op.and]: [sqlWhere(literal('true'), mustHaveEmployee)],
    },
    include: [
      {
        model: Employees,
        as: 'employee',
        attributes: ['name_th', 'surname_th', 'department_name'],
        required: false, // ใช้ LEFT JOIN
      },
    ],
    order: [['assigned_at', 'DESC']],
    limit: pageSize,
    offset,
    raw: true,
    nest: true,
  });

  const items = rows.map((r: any) => ({
    assignment_id: r.assignment_id,
    emp_code: r.emp_code,
    status: r.status,
    valid_from: r.valid_from,
    valid_to: r.valid_to,
    assigned_at: r.assigned_at,
    assigned_by: r.assigned_by,
    revoked_at: r.revoked_at,
    revoked_by: r.revoked_by,
    name_th: r.employee?.name_th ?? null,
    surname_th: r.employee?.surname_th ?? null,
    department_name: r.employee?.department_name ?? null,
  }));

  return {
    items,
    total,
    pageIndex: safeIndex,
    pageSize,
    pageCount,
    hasPrev: safeIndex > 0,
    hasNext: safeIndex < pageCount - 1,
  };
}

// ------------------------------
// Assign exception to employees (transaction)
// ------------------------------
export async function assignExceptionToEmployees(
  exceptionId: number,
  empCodes: string[],
  assignedBy?: string,
) {
  if (!empCodes.length) return { inserted: 0, reactivated: 0 };

  return await sequelize.transaction(async (t) => {
    // 1) Reactivate (revoked -> active)
    const [reactCount, reactRows] = await ExceptionAssignment.update(
      {
        status: 'active',
        assigned_at: fn('now') as unknown as Date,
        // ถ้าไม่ได้ส่ง assignedBy → คงค่าเดิมของคอลัมน์เดิม
        assigned_by: assignedBy ?? (literal('"assigned_by"') as unknown as string),
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
      },
      {
        where: {
          exception_id: exceptionId,
          emp_code: { [Op.in]: empCodes },
          status: 'revoked',
        },
        returning: true,
        transaction: t,
      }
    );

    // 2) Insert ใหม่เฉพาะที่ยังไม่มี (unique (exception_id, emp_code, status))
    const payload = empCodes.map((emp) => ({
      exception_id: exceptionId,
      emp_code: emp,
      status: 'active' as const,
      assigned_by: assignedBy ?? null,
      assigned_at: fn('now') as unknown as Date,
    }));

    const insertedRows = await ExceptionAssignment.bulkCreate(payload, {
      ignoreDuplicates: true,
      transaction: t,
      returning: true,
    });

    const assignmentIds = [
      ...(reactRows || []).map((r: any) => r.assignment_id),
      ...insertedRows.map((r) => r.assignment_id),
    ];

    return {
      inserted: insertedRows.length,
      reactivated: reactCount || 0,
      assignmentIds,
    };
  });
}

// ------------------------------
// Revoke assignments
// ------------------------------
export async function revokeAssignments(
  exceptionId: number,
  empCodes: string[],
  revokedBy?: string,
  reason?: string,
) {
  if (!empCodes.length) return { updated: 0 };

  const values: any = {
    status: 'revoked',
    revoked_at: fn('now') as unknown as Date,
    revoked_by: revokedBy ?? null,
  };
  // ถ้าไม่ได้ส่ง reason → คงค่าของ revoke_reason เดิมไว้ (ไม่แตะ)
  if (reason !== undefined && reason !== null) {
    values.revoke_reason = reason;
  }

  const [affected] = await ExceptionAssignment.update(values, {
    where: {
      exception_id: exceptionId,
      emp_code: { [Op.in]: empCodes },
      status: 'active',
    },
  });

  return { updated: affected || 0 };
}

// ------------------------------
// Simple list
// ------------------------------
export async function listExceptionsSimple(limit = 10) {
  const rows = await ExceptionList.findAll({
    attributes: ['exception_id', 'code', 'name', 'risk_level', 'is_active'],
    order: [['exception_id', 'DESC']],
    limit,
    raw: true,
  });
  return rows as any[];
}