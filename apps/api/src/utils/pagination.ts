export function parsePaging(q: any) {
  const pageIndex = Math.max(1, Number(q.pageIndex ?? 1)); // 1-based
  const pageSize = Math.min(200, Math.max(1, Number(q.pageSize ?? 10)));

  // สำหรับฐานข้อมูล (เช่น SQL OFFSET) ต้องเป็น 0-based
  const offset = (pageIndex - 1) * pageSize;
  const limit = pageSize;

  // ช่วงลำดับแถวแบบ 1-based (ออปชัน)
  const start = offset + 1;        // แถวแรกของหน้านี้ (1-based)
  const end = offset + pageSize;   // แถวสุดท้ายโดยคำนวณ (อาจเกิน total ถ้ายังไม่รู้จำนวนทั้งหมด)

  return { pageIndex, pageSize, offset, limit, start, end };
}


export function parseSort(q: any, allow: string[], defaultSort = 'exception_id:desc') {
  const raw: string = q.sort ?? defaultSort;
  const [id, dir] = String(raw).split(':');
  const col = allow.includes(id) ? id : defaultSort.split(':')[0];
  const desc = String(dir).toLowerCase() === 'desc';
  return { col, desc };
}