import { col, literal, Op, Sequelize } from "sequelize";
import {
  sequelize,
  ExceptionList,
  ExceptionAssignment,
  ExceptionTicketMap,
  Employees,
} from "../models";
import { Col, Literal } from "sequelize/types/utils";

export type ListExceptionsParams = {
  search?: string;
  risk?: "Low" | "Medium" | "High";
  categoryId?: number;
  isActive?: boolean;
  sort?: { col: string; desc: boolean };
  pageIndex: number;
  pageSize: number;
};

// นำเข้า helper และชนิดข้อมูลที่ต้องใช้
  
const SORT_COL_MAP: Record<string, Col | Literal | string> = {
  exception_id: col('"ExceptionList"."exception_id"'),
  code: col('"ExceptionList"."code"'),
  name: col('"ExceptionList"."name"'),
  risk_level: col('"ExceptionList"."risk_level"'),
  category_id: col('"ExceptionList"."category_id"'),
  is_active: col('"ExceptionList"."is_active"'),
  created_at: col('"ExceptionList"."created_at"'),

  assignees_active: literal(`(
    SELECT COUNT(*)
    FROM public.exception_assignment x
    WHERE x.exception_id = "ExceptionList"."exception_id"
      AND x.status = 'active'
  )`),

  last_assigned_at: literal(`(
    SELECT MAX(assigned_at)
    FROM public.exception_assignment x
    WHERE x.exception_id = "ExceptionList"."exception_id"
  )`),

  tickets_count: literal(`(
    SELECT COUNT(*)
    FROM public.exception_ticket_map t
    WHERE t.exception_id = "ExceptionList"."exception_id"
  )`),
};

export async function listExceptions(p: ListExceptionsParams) {
  const where: any = {};
  if (p.search) where.name = { [Op.iLike]: `%${p.search}%` };
  if (p.risk) where.risk_level = p.risk;
  if (p.categoryId) where.category_id = p.categoryId;
  if (typeof p.isActive === "boolean") where.is_active = p.isActive;

  const sortColKey = p.sort?.col ?? "exception_id";
  const sortDir = p.sort?.desc ? "DESC" : "ASC";
  const sortCol = SORT_COL_MAP[sortColKey] ?? SORT_COL_MAP["exception_id"];

  const attributes = [
    "exception_id",
    "code",
    "name",
    "risk_level",
    "category_id",
    "is_active",
    "created_at",
    [
      Sequelize.literal(`(
        SELECT COUNT(*)
        FROM public.exception_assignment a
        WHERE a.exception_id = "ExceptionList"."exception_id"
          AND a.status = 'active'
      )`),
      "assignees_active",
    ],
    [
      Sequelize.literal(`(
        SELECT COALESCE(MAX(assigned_at), NULL)
        FROM public.exception_assignment a
        WHERE a.exception_id = "ExceptionList"."exception_id"
      )`),
      "last_assigned_at",
    ],
    [
      Sequelize.literal(`(
        SELECT COUNT(*)
        FROM public.exception_ticket_map t
        WHERE t.exception_id = "ExceptionList"."exception_id"
      )`),
      "tickets_count",
    ],
  ] as const;

  const result = await ExceptionList.findAndCountAll({
    where,
    attributes: attributes as any,
    order: [[sortCol as any, sortDir]],
    limit: p.pageSize,
    offset: p.pageIndex * p.pageSize,
    subQuery: false,
    raw: true,
  });

  return { items: result.rows as any[], total: result.count as number };
}

export async function getExceptionById(exceptionId: number) {
  const row = await ExceptionList.findOne({
    where: { exception_id: exceptionId },
    attributes: [
      "*",
      [
        Sequelize.literal(`(
          SELECT COUNT(*)
          FROM public.exception_assignment a
          WHERE a.exception_id = "ExceptionList"."exception_id"
            AND a.status = 'active'
        )`),
        "assignees_active",
      ],
      [
        Sequelize.literal(`(
          SELECT COUNT(*)
          FROM public.exception_ticket_map t
          WHERE t.exception_id = "ExceptionList"."exception_id"
        )`),
        "tickets_count",
      ],
    ] as any,
    raw: true,
  });

  return (row as any) ?? null;
}

export async function listAssigneesByException(
  exceptionId: number,
  pageIndex: number,
  pageSize: number,
) {
  const { rows, count } = await ExceptionAssignment.findAndCountAll({
    where: { exception_id: exceptionId },
    include: [
      {
        model: Employees,
        as: "employee",
        attributes: ["name_th", "surname_th", "department_name"],
        required: true,
      },
    ],
    order: [["assigned_at", "DESC"]],
    limit: pageSize,
    offset: pageIndex * pageSize,
    raw: true,
    nest: true,
  });

  const items = (rows as any[]).map((r) => ({
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

  return { items, total: count as number };
}

export async function assignExceptionToEmployees(
  exceptionId: number,
  empCodes: string[],
  assignedBy?: string,
) {
  if (!empCodes.length) return { inserted: 0, reactivated: 0 };

  return await sequelize.transaction(async (t) => {
    const [reactCount, reactRows] = await ExceptionAssignment.update(
      {
        status: "active",
        assigned_at: Sequelize.fn("now") as unknown as Date,
        assigned_by: assignedBy ?? Sequelize.col("assigned_by"),
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
      },
      {
        where: {
          exception_id: exceptionId,
          emp_code: { [Op.in]: empCodes },
          status: "revoked",
        },
        returning: true,
        transaction: t,
      },
    );

    const payload = empCodes.map((emp) => ({
      exception_id: exceptionId,
      emp_code: emp,
      status: "active" as const,
      assigned_by: assignedBy ?? null,
      assigned_at: Sequelize.fn("now") as unknown as Date,
    }));

    const insertedRows = await ExceptionAssignment.bulkCreate(payload, {
      ignoreDuplicates: true, // ต้องมี unique index (exception_id, emp_code, status)
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

export async function revokeAssignments(
  exceptionId: number,
  empCodes: string[],
  revokedBy?: string,
  reason?: string,
) {
  if (!empCodes.length) return { updated: 0 };

  const values: any = {
    status: "revoked",
    revoked_at: Sequelize.fn("now") as unknown as Date,
    revoked_by: revokedBy ?? null,
  };
  if (reason !== undefined && reason !== null) {
    values.revoke_reason = reason;
  }

  const [affected] = await ExceptionAssignment.update(values, {
    where: {
      exception_id: exceptionId,
      emp_code: { [Op.in]: empCodes },
      status: "active",
    },
  });

  return { updated: affected || 0 };
}

export async function listExceptionsSimple(limit = 10) {
  const rows = await ExceptionList.findAll({
    attributes: ["exception_id", "code", "name", "risk_level", "is_active"],
    order: [["exception_id", "DESC"]],
    limit,
    raw: true,
  });
  return rows as any[];
}
