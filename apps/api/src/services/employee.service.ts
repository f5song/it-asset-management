// src/services/employees.service.ts
import {
  Op,
  literal,
  FindAndCountOptions,
  WhereOptions,
  FindOptions,
  where as sqlWhere,
} from "sequelize";
import { Employee } from "../models/Employee";
import { normalize1BasedPaging, withPaging } from "../utils/pagination";

/* =========================
 * Types
 * ========================= */
export type EmployeesListParams = {
  /**   1-based page (จาก controller/route) */
  page: number;          // <-- เปลี่ยนจาก pageIndex (0-based) เป็น page (1-based)
  pageSize: number;
  search?: string;
  status?: "Active" | "Resigned";
  type?: string | null; // department_name
  sort?: { col?: string; desc?: boolean } | undefined; // รองรับ "status_priority"

  /** กรอง "เฉพาะพนักงานที่ไม่มี Active assignment" ใน exception นี้ */
  excludeAssignedForExceptionId?: number | null;
};

export type EmployeesListResult = {
  items: any[];
  total: number;
  /** meta (ถูกเติมโดย withPaging เป็น 1-based) */
  pageIndex?: number; // 1-based
  pageSize?: number;
  pageCount?: number;
  hasPrev?: boolean;
  hasNext?: boolean;
};

/* =========================
 * Mapping: UI Status ↔ DB Code
 * ========================= */
const UI_STATUS_TO_CODE: Record<string, string> = {
  Active: "A",
  Resigned: "R",
};
const CODE_TO_UI_STATUS: Record<string, string> = {
  A: "Active",
  R: "Resigned",
};

/* =========================
 * sort key จาก UI → คอลัมน์จริง
 * ========================= */
const SORT_MAP_UI_TO_DB: Record<string, string> = {
  id: "emp_code",
  emp_code: "emp_code",
  firstNameTh: "name_th",
  lastNameTh: "surname_th",
  name_th: "name_th",
  surname_th: "surname_th",
  department: "department_name",
  company: "company_name",
  section: "section_name",
  unit: "unit_name",
  email: "e_mail",
  phone: "work_phone_in",
  position: "posi_name_th",
  status: "emp_stus",
  beginDate: "ebegin_date",
  resignDate: "resign_date",
  updatedAt: "update_time",
  empType: "emp_type",
};

function STATUS_PRIORITY_LITERAL() {
  return `CASE emp_stus
            WHEN 'A' THEN 0
            WHEN 'R' THEN 1
            ELSE 999
          END`;
}

function resolveSort(p: Pick<EmployeesListParams, 'sort'>) {
  const sortKey = p.sort?.col ?? "emp_code";
  const sortDir = p.sort?.desc ? "DESC" : "ASC";
  if (sortKey === "status_priority") {
    return { priority: true as const, dir: sortDir };
  }
  const dbCol = SORT_MAP_UI_TO_DB[sortKey] ?? "emp_code";
  return { priority: false as const, dbCol, dir: sortDir };
}

function buildWhere(p: Pick<EmployeesListParams, 'search' | 'status' | 'type'>): WhereOptions {
  const where: any = {};
  const search = (p.search ?? "").trim();

  if (search) {
    const pattern = `%${search}%`;
    where[Op.or] = [
      { emp_code: { [Op.iLike]: pattern } },
      { name_th: { [Op.iLike]: pattern } },
      { surname_th: { [Op.iLike]: pattern } },
      { name_eng: { [Op.iLike]: pattern } },
      { surname_eng: { [Op.iLike]: pattern } },
      { company_name: { [Op.iLike]: pattern } },
      { department_name: { [Op.iLike]: pattern } },
      { section_name: { [Op.iLike]: pattern } },
      { unit_name: { [Op.iLike]: pattern } },
      { posi_name_th: { [Op.iLike]: pattern } },
      { e_mail: { [Op.iLike]: pattern } },
      { work_phone_in: { [Op.iLike]: pattern } },
    ];
  }

  if (p.status) {
    const code = UI_STATUS_TO_CODE[p.status];
    if (code) where.emp_stus = code;
    else where.emp_stus = null; // ไม่ตรงอะไรเลย
  }

  if (p.type && p.type.trim() !== "") {
    // ถ้าต้องการ exact match ให้เปลี่ยนเป็น { [Op.eq]: p.type.trim() }
    where.department_name = { [Op.iLike]: p.type.trim() };
  }

  return where;
}

/* =========================
 * Public API (1-based pagination)
 * ========================= */


export async function listEmployees(p: EmployeesListParams) {
  const { pageIndex0, pageSize, offset, limit } = normalize1BasedPaging({
    pageIndex1: p.page,
    pageSize: p.pageSize,
    pageSizeDefault: 10,
    pageSizeMax: 100,
  });

  // where หลัก (search/status/type) — ของเดิมคุณใช้อยู่
  const where = buildWhere({ search: p.search, status: p.status, type: p.type });

  //   จุดสำคัญ: ซ่อนพนักงานที่ "กำลัง Active" ใน exception นี้
  const andConds: any[] = [];
  if (p.excludeAssignedForExceptionId != null) {
    const exceptionIdNum = Number(p.excludeAssignedForExceptionId);
    if (!Number.isNaN(exceptionIdNum)) {
      const notExistsActiveForException = literal(`
        NOT EXISTS (
          SELECT 1
          FROM public.exception_assignment a
          WHERE a.emp_code = "Employee"."emp_code"
            AND a.exception_id = ${exceptionIdNum}
            AND a.status = 'active'      --   เงื่อนไข "กำลัง Active"
      )`);
      andConds.push(sqlWhere(literal("true"), notExistsActiveForException));
    }
  }

  const finalWhere: WhereOptions =
    andConds.length > 0 ? { [Op.and]: [where, ...andConds] } : where;

  const attributes: FindOptions["attributes"] = [
    ["emp_code", "id"], ["name_th", "firstNameTh"], ["surname_th", "lastNameTh"],
    ["name_eng", "firstNameEn"], ["surname_eng", "lastNameEn"],
    ["company_name", "company"], ["department_name", "department"],
    ["section_name", "section"], ["unit_name", "unit"], ["posi_name_th", "position"],
    ["e_mail", "email"], ["work_phone_in", "phone"],
    [literal(`CASE emp_type WHEN 'P' THEN 'Permanent' WHEN 'C' THEN 'Contract' ELSE NULL END`),"empType"],
    ["ebegin_date", "beginDate"], ["resign_date", "resignDate"], ["update_time", "updatedAt"],
    [literal(`CASE emp_stus WHEN 'A' THEN 'Active' WHEN 'R' THEN 'Resigned' ELSE 'Unknown' END`),"status"],
  ];

  const resolved = resolveSort({ sort: p.sort });
  const order: FindAndCountOptions["order"] =
    resolved.priority ? [ literal(`${STATUS_PRIORITY_LITERAL()} ${resolved.dir}`), ["emp_code","ASC"] ] as any
                      : [ [resolved.dbCol, resolved.dir] ];

  const baseOptions: FindAndCountOptions = {
    where: finalWhere, attributes, order, limit, offset, raw: true
  };

  const result = await Employee.findAndCountAll(baseOptions);

  if ((result?.count ?? 0) > 0 && (result?.rows?.length ?? 0) === 0) {
    const retry = await Employee.findAndCountAll({ ...baseOptions, order: [["emp_code","ASC"]], offset: 0 });
    return withPaging((retry.rows as any[]) ?? [], Number(retry.count ?? 0), 0, pageSize);
  }

  return withPaging((result?.rows as any[]) ?? [], Number(result?.count ?? 0), pageIndex0, pageSize);
}

export async function getEmployeeById(empCode: string) {
  const attributes: FindOptions["attributes"] = [
    ["emp_code", "id"],
    ["name_th", "firstNameTh"],
    ["surname_th", "lastNameTh"],
    ["name_eng", "firstNameEn"],
    ["surname_eng", "lastNameEn"],
    ["company_name", "company"],
    ["department_name", "department"],
    ["section_name", "section"],
    ["unit_name", "unit"],
    ["posi_name_th", "position"],
    ["e_mail", "email"],
    ["work_phone_in", "phone"],
    [
      literal(
        `CASE emp_type WHEN 'P' THEN 'Permanent' WHEN 'C' THEN 'Contract' ELSE NULL END`,
      ),
      "empType",
    ],
    ["ebegin_date", "beginDate"],
    ["resign_date", "resignDate"],
    ["update_time", "updatedAt"],
    [
      literal(
        `CASE emp_stus WHEN 'A' THEN 'Active' WHEN 'R' THEN 'Resigned' ELSE 'Unknown' END`,
      ),
      "status",
    ],
  ];

  const row = await Employee.findOne({
    where: { emp_code: empCode },
    attributes,
    raw: true,
  });

  return row ?? null;
}