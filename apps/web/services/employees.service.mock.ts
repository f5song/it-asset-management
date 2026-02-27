// src/services/employees.service.mock.ts
import type {
  EmployeeItem,
  EmployeeStatus,
  EmployeesListQuery,
  EmployeesListResponse,
  EmployeeType, //   ใช้สำหรับ mock EMP_TYPES
} from "@/types/employees";

// ──────────────────────────────────────────────────────────────────────────────
// Mock dataset
// ──────────────────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "สำนักการตลาด",
  "สำนักข่าว",
  "สำนักผลิตรายการ",
  "สำนักกรรมการบริหาร",
  "สำนักกิจการและสื่อสารองค์กร",
  "สำนักทรัพยากรมนุษย์",
  "สำนักดิจิทัลและกลยุทธ์สื่อใหม่",
  "สำนักไฟฟ้ากำลัง",
  "สำนักเทคนิคโทรทัศน์",
  "สำนักการพาณิชย์",
] as const;

const COMPANIES = [
  "บจก. บีอีซีไอ คอร์ปอเรชั่น",
  "บริษัท บางกอกเอ็นเตอร์เทนเม้นต์ จำกัด",
  "บริษัท บีอีซี-มัลติมีเดีย จำกัด",
  "บริษัท บีอีซี เวิลด์ จำกัด (มหาชน)",
] as const;
const SECTIONS = [
  "ฝ่ายการตลาดธุรกิจระหว่างประเทศ",
  "ฝ่ายจัดการธุรกิจระหว่างประเทศ",
  "ฝ่ายจัดการสัญญาและทรัพย์สินทางปัญญาระหว่างประเทศ",
  "ฝ่ายบัญชี",
  "ฝ่ายBIZ Intelligence and Applications",
  "ฝ่ายข่าวมัลติมีเดีย",
  "ฝ่ายสื่อสารองค์กร",
  "ฝ่ายกิจการองค์กร",
  "ฝ่ายกฎหมาย",
  "ฝ่ายเลขานุการบริษัท",
  "ฝ่ายการขายโฆษณาโทรทัศน์",
  "ฝ่ายจัดการคอนเทนต์ระหว่างประเทศ",
  "ฝ่ายDigital & New Media Strategy",
  "ฝ่าย Creative and Design Center",
  "ฝ่ายManagement Report",
  "ฝ่ายHRM & Resource Management",
  "ฝ่ายผลิตละคร",
  "ฝ่ายTV Station Marketing",
  "ฝ่ายSocial and Digital Marketing",
  "ฝ่ายBroadcast Support",
  "ฝ่ายพัฒนาธุรกิจและการลงทุน",
  "ฝ่ายกลยุทธ์การตลาด",
  "ฝ่ายสนับสนุนการปฏิบัติการ",
  "ฝ่ายHRBP",
  "ฝ่ายสนับสนุนการผลิต",
  "ฝ่ายProject Management Office",
  "ฝ่ายจัดการผังรายการ",
  "ฝ่ายสนับสนุนการพาณิชย์",
  "ฝ่ายผู้ประกาศข่าว",
  "ฝ่ายจัดการงานขาย",
  "ฝ่ายศิลปกรรม",
  "ฝ่ายIT Operation and Infrastructure",
  "ฝ่ายไฟฟ้ากำลัง",
  "ฝ่ายการเงิน",
  "ฝ่ายผลิตรายการ",
  "ฝ่ายข่าวโทรทัศน์",
  "ฝ่ายตรวจสอบภายใน",
  "ฝ่ายสร้างสรรค์กิจกรรมและส่งเสริมการขาย",
  "ฝ่ายTechnology & Platform Management",
  "ฝ่ายสนับสนุนเทคนิคการออกอากาศ",
  "ฝ่ายจัดการผลิตรายการ",
  "ฝ่ายแต่งเพลงประกอบละครโทรทัศน์",
  "ฝ่ายออกอากาศ",
] as const;
const UNITS = [
  "แผนกข่าวมัลติมีเดีย",
  "แผนกงานข่าว",
  "แผนกIT Operation ",
  "แผนกAR Accounting",
  "แผนกผังรายการ",
  "แผนกไฟล์รายการ",
  "แผนกการตลาดและสนับสนุนการขาย",
  "แผนกกฎหมาย.",
  "แผนกเทคนิคสนับสนุนการผลิตรายการ",
  "แผนกการขาย-กลุ่มลูกค้า Direct 1",
  "แผนกผู้ประกาศข่าว",
  "แผนกPlatform Optimization",
  "แผนกFinance",
  "แผนกSpecial Unit2",
  "แผนก Non-ERP",
  "แผนก Platform Marketing Strategy",
  "แผนกBroadcast Management System",
  "แผนกประชาสัมพันธ์",
  "แผนกถ่ายทอดนอกสถานที่",
  "แผนกกำกับออกอากาศ",
  "แผนกเชื่อมโยงสัญญาณ",
  "แผนกธุรการและบริหารทรัพย์สิน",
  "แผนกการขาย- กลุ่มลูกค้า Agency 3",
  "แผนกกราฟฟิก",
  "แผนกจัดซื้อและพัสดุ",
  "แผนกกิจกรรมเพื่อสังคมและความยั่งยืน",
  "แผนกIT Application and Customer Support",
  "แผนกProduct Development",
  "แผนกเทคนิคกราฟฟิกและตัดต่อรายการ",
  "แผนกDigital Marketing Strategy",
  "แผนกContent Editorial",
  "แผนกประสานงานรายการ",
  "แผนกบริการ",
  "แผนกจัดการออกอากาศ",
  "แผนกครอบครัวบันเทิง",
  "แผนกPlatform Development",
  "แผนกวิเคราะห์ข้อมูลขาย",
  "แผนกแสง",
  "แผนกสตูดิโอ",
  "แผนกเครื่องปรับอากาศและป้องกันอัคคีภัย",
  "แผนกสนับสนุนการออกอากาศ",
  "แผนกผู้ช่วยช่างภาพ",
  "แผนกการขาย- กลุ่มลูกค้า Agency 2",
  "แผนกคอนโทรล",
  "แผนกองค์กรสัมพันธ์",
  "แผนกIT Service Delivery",
  "แผนกการขาย-กลุ่มลูกค้า Direct 3",
  "แผนก TV Rating",
  "แผนกบริหารคิวโฆษณา",
  "แผนกข้อมูลภาพและข่าวIngest & Library",
  "แผนกตรวจสอบเทปโฆษณา",
  "แผนกการขาย-กลุ่มลูกค้าออนไลน์",
  "แผนกERP",
  "แผนกManagement Report",
  "แผนกช่างภาพ",
  "แผนกสนับสนุนการขาย",
  "แผนก Platform Optimization",
  "แผนกการขาย- กลุ่มลูกค้า Agency 1",
] as const;

const POSITION = [
  "Application Developer Specialist",
  "System Analyst",
  "IT Support Engineer",
  "Business Analyst",
] as const;

// แนะนำให้ใช้ค่า status ที่แน่ใจว่าอยู่ใน union จริงของ EmployeeStatus
const STATUSES: EmployeeStatus[] = ["Active", "Resigned"];

// ตัวอย่างประเภทพนักงาน (ให้สอดคล้องกับ EmployeeType จริงของคุณ)
const EMP_TYPES: EmployeeType[] = [
  "Permanent",
  "Contractor",
] as unknown as EmployeeType[];

// ตัวอย่างชื่อ-สกุลภาษาไทย/อังกฤษ (สุ่มผสม)
const FIRST_TH = [
  "ภัทรภร",
  "กิตติ",
  "ปณิธาน",
  "มณีรัตน์",
  "ธนกร",
  "ชลธิชา",
  "ศุภชัย",
  "ณัฐวดี",
] as const;
const LAST_TH = [
  "จิตต์ปราณี",
  "สถาพร",
  "อรุณสวัสดิ์",
  "วีรวัฒน์",
  "ปิ่นมณี",
  "วรรณศิลป์",
] as const;

const FIRST_EN = [
  "Jane",
  "John",
  "Alice",
  "Bob",
  "Peter",
  "Sara",
  "Emily",
  "David",
] as const;
const LAST_EN = [
  "Doe",
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Miller",
] as const;

// สร้างพนักงานจำลอง 73 รายการ
const MOCK_EMPLOYEES: EmployeeItem[] = Array.from({ length: 73 }).map(
  (_, i) => {
    const id = `E-${(i + 1).toString().padStart(3, "0")}`;

    // pick แบบวนลูป
    const firstNameTh = FIRST_TH[i % FIRST_TH.length];
    const lastNameTh = LAST_TH[i % LAST_TH.length];
    const firstNameEn = FIRST_EN[i % FIRST_EN.length];
    const lastNameEn = LAST_EN[i % LAST_EN.length];

    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const company = COMPANIES[i % COMPANIES.length];
    const section = SECTIONS[i % SECTIONS.length];
    const unit = UNITS[i % UNITS.length];
    const position = POSITION[i % POSITION.length];
    const status = STATUSES[i % STATUSES.length];
    const empType = EMP_TYPES[i % EMP_TYPES.length];

    // ทำให้บางรายการไม่มี device เพื่อเทส UI
    const device =
      i % 7 === 0 ? null : `LAPTOP-${(i + 1).toString().padStart(3, "0")}`;

    // ทำให้เบอร์โทร/อีเมลมี pattern
    const phone = `${(1234 + i).toString()}`; // 10 หลัก
    const email = `user${i + 1}@becworld.com`;

    return {
      id,
      // ===== ชื่อ-นามสกุล (ไทย/อังกฤษ)
      firstNameTh,
      lastNameTh,
      firstNameEn,
      lastNameEn,

      // ===== ข้อมูลสถานะ/งาน/ติดต่อ
      status,
      empType,
      email,
      phone,
      position,
      company,
      department,
      section,
      unit,

      // อุปกรณ์หลัก (nullable)
      device,
    } as EmployeeItem;
  },
);

// ──────────────────────────────────────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────────────────────────────────────

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      const onAbort = () => {
        clearTimeout(t);
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      };
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

const ci = (s?: string) => (s ?? "").toLowerCase();
const includesCI = (text: string, q: string) => ci(text).includes(ci(q));

/** safe getter สำหรับ key ที่อาจไม่ใช่ keyof ตรง ๆ */
function getValue(obj: Record<string, unknown>, key: string) {
  return (obj as any)[key];
}

/** รวมชื่อสำหรับค้นหาแบบเร็ว */
function nameTokens(e: EmployeeItem) {
  return [e.firstNameTh, e.lastNameTh, e.firstNameEn, e.lastNameEn]
    .filter(Boolean)
    .join(" ");
}

// ──────────────────────────────────────────────────────────────────────────────
/** 🔎 NEW: ค้นหาพนักงานแบบ quick search (mock) */
export async function searchEmployees(
  query: string,
  signal?: AbortSignal,
): Promise<EmployeeItem[]> {
  await sleep(120, signal);
  const q = (query ?? "").trim();
  if (!q) return [];
  const k = q.toLowerCase();

  // คืนผลลัพธ์ไม่เกิน 20 รายการพอสำหรับแสดง suggestion
  return MOCK_EMPLOYEES.filter(
    (e) =>
      e.id.toLowerCase().includes(k) ||
      includesCI(nameTokens(e), k) ||
      includesCI(e.email ?? "", k) ||
      includesCI(e.department ?? "", k) ||
      includesCI(e.company ?? "", k) ||
      includesCI(e.section ?? "", k) ||
      includesCI(e.unit ?? "", k) ||
      includesCI(e.position ?? "", k) ||
      includesCI(e.position ?? "", k) ||
      includesCI(e.empType ?? "", k) ||
      includesCI(e.device ?? "", k),
  ).slice(0, 20);
}

// ──────────────────────────────────────────────────────────────────────────────
// Mock Service API (ตามโครงสร้างใหม่)
// ──────────────────────────────────────────────────────────────────────────────

/** GET /employees/:id */
export async function getEmployeeById(
  id: string | number,
  signal?: AbortSignal,
): Promise<EmployeeItem | null> {
  await sleep(80, signal);
  return MOCK_EMPLOYEES.find((e) => String(e.id) === String(id)) ?? null;
}

/**
 * GET /employees (with filters/sort/pagination)
 * รูปแบบ query ที่รองรับ:
 *   - page (1-based), pageSize
 *   - search
 *   - status, department
 *   - sortBy, sortOrder (ถ้ามี)
 * รูปแบบ response: { items, totalCount, page (1-based), pageSize, hasNext, hasPrev }
 */
export async function listEmployees(
  q: EmployeesListQuery,
  signal?: AbortSignal,
): Promise<EmployeesListResponse> {
  await sleep(150, signal);

  let filtered = [...MOCK_EMPLOYEES];

  // ----- Search -----
  const search = (q.search ?? "").trim();
  if (search) {
    filtered = filtered.filter(
      (e) =>
        includesCI(e.id, search) ||
        includesCI(nameTokens(e), search) ||
        includesCI(e.department ?? "", search) ||
        includesCI(e.company ?? "", search) ||
        includesCI(e.section ?? "", search) ||
        includesCI(e.unit ?? "", search) ||
        includesCI(e.status ?? "", search) ||
        includesCI(e.email ?? "", search) ||
        includesCI(e.position ?? "", search) ||
        includesCI(e.phone ?? "", search) || // (เดิมซ้ำ position 2 รอบ —ผมแก้เหลือ 1 รอบ)
        includesCI(e.device ?? "", search) ||
        includesCI(e.empType ?? "", search),
    );
  }

  // ----- Filters -----
  if (q.status) {
    const s = ci(q.status);
    filtered = filtered.filter((e) => ci(e.status) === s);
  }

  if (q.department) {
    // แก้บั๊ก: เดิมใช้ q.type → ต้องเป็น q.department
    const d = ci(q.type); // <-- กัน null
    filtered = filtered.filter((e) => ci(e.department ?? undefined) === d); // <-- กัน null
  }

  // ----- Sort (optional) -----
  if ((q as any).sortBy) {
    const sortBy = String((q as any).sortBy);
    const dir = (q as any).sortOrder === "desc" ? -1 : 1;

    if (sortBy === "status_priority" && !q.status /* All Status */) {
      //   Global: Active -> Resigned -> (else)  แล้ว secondary ด้วย id ASC
      const priority = new Map<string, number>([
        ["Active", 0],
        ["Resigned", 1],
      ]);
      filtered.sort((a, b) => {
        const pa = priority.get(a.status as any) ?? 999;
        const pb = priority.get(b.status as any) ?? 999;
        if (pa !== pb) return (pa - pb) * dir;

        return a.id.localeCompare(b.id, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
    } else {
      // generic sort for a field
      filtered.sort((a, b) => {
        const A = getValue(a as any, sortBy);
        const B = getValue(b as any, sortBy);

        if (A == null && B == null) return 0;
        if (A == null) return -1 * dir;
        if (B == null) return 1 * dir;

        if (typeof A === "number" && typeof B === "number") {
          return (A - B) * dir;
        }

        const da = new Date(A as any);
        const db = new Date(B as any);
        const aIsDate = !isNaN(da.valueOf());
        const bIsDate = !isNaN(db.valueOf());
        if (aIsDate && bIsDate) return (da.getTime() - db.getTime()) * dir;

        const As = String(A);
        const Bs = String(B);
        return (
          As.localeCompare(Bs, undefined, {
            numeric: true,
            sensitivity: "base",
          }) * dir
        );
      });
    }
  } else {
    // default: id ASC (numeric-aware)
    filtered.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  }

  // ----- Pagination (มาตรฐานใน type: page 1-based, pageSize) -----
  const page = Math.max(1, Number((q as any).page ?? 1)); // 1-based
  const pageSize = Math.max(1, Number((q as any).pageSize ?? 10));
  const start = (page - 1) * pageSize;

  const totalCount = filtered.length;
  const items = filtered.slice(start, start + pageSize);
  const hasPrev = page > 1;
  const hasNext = start + items.length < totalCount;

  return {
    items,
    totalCount,
    page,
    pageSize,
    hasNext,
    hasPrev,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** ดึงทั้งหมดแบบเร็ว (ตั้ง pageSize ใหญ่) */
export async function getAllEmployeesQuick(
  signal?: AbortSignal,
): Promise<EmployeeItem[]> {
  const res = await listEmployees(
    { page: 1, pageSize: 9999, search: "" } as EmployeesListQuery,
    signal,
  );
  return res.items ?? [];
}

/** ดึงทั้งหมดแบบวนหน้า (robust) */
export async function getAllEmployees(
  signal?: AbortSignal,
): Promise<EmployeeItem[]> {
  const out: EmployeeItem[] = [];
  const pageSize = 50;
  let page = 1; // 1-based

  while (true) {
    const res = await listEmployees(
      { page, pageSize } as EmployeesListQuery,
      signal,
    );
    const items: EmployeeItem[] = res.items ?? [];
    out.push(...items);

    if (!res.hasNext) break; // ใช้ธงจาก response โดยตรง
    page += 1;
  }

  return out;
}
