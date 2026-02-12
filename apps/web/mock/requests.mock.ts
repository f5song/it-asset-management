import { RequestItem, RequestRisk } from "@/types/exception";


export const FILTER_OPTIONS = {
  sites: ["บริษัท บีอีซี แอสเซท จำกัด",
"บริษัท บีอีซี-มัลติมีเดีย จำกัด",
"บจก. บีอีซี ไอที โซลูชั่น",
"บจก. บีอีซีไอ คอร์ปอเรชั่น",
"บริษัท บางกอกเอ็นเตอร์เทนเม้นต์ จำกัด",
"บริษัท บีอีซี บรอดคาสติ้ง เซ็นเตอร์ จำกัด",
"บริษัท สำนักข่าว บีอีซี จำกัด",
"บริษัท บีอีซี เวิลด์ จำกัด (มหาชน)"] as const,
  risks: ['Low', 'Medium', 'High'] as const,
  exceptions: ['AD 90 : Password Policy', 'LINE', 'USB', 'Generative AI'] as const,
};

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeTitle(i: number) {
  const apps = ['AD 90 : Password Policy', 'LINE', 'USB', 'Generative AI'];
  const acts = ['ขออนุมัติใช้งาน', 'ขอเพิ่มสิทธิ์', 'ขอติดตั้ง', 'ขอเปลี่ยนเวอร์ชัน', 'ขอยกเลิกสิทธิ์'];
  return `${pick(apps)} - ${pick(acts)}`;
}


export const MOCK_REQUESTS: RequestItem[] = Array.from({ length: 1250 }).map((_, i) => {
  const risk: RequestRisk = pick(['Low','Medium','High']);
  const site = pick(FILTER_OPTIONS.sites);
  const exception = pick(FILTER_OPTIONS.exceptions);
  const dueAt = new Date(Date.now() + (i % 30) * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: 7300 + i,
    title: makeTitle(i),
    requester: 'Puttaraporn Jitpranee',
    department: pick(["สำนักข่าว",
"สำนักออกอากาศ",
"สำนักตรวจสอบภายใน",
"สำนักไฟฟ้ากำลัง",
"สำนักเทคโนโลยีสารสนเทศ",
"สำนักเทคนิคโทรทัศน์",
"สำนักผังรายการ",
"สำนักกรรมการบริหาร",
"สำนักธุรกิจระหว่างประเทศ",
"สำนักการพาณิชย์",
"สำนักกิจการและสื่อสารองค์กร",
"สำนักบริหาร",
"สำนักดิจิทัลและกลยุทธ์สื่อใหม่",
"สำนักการตลาด",
"สำนักการเงินและบัญชี",
"สำนักบริหารทรัพยากร",
"สำนักผลิตรายการ"]),
    site,
    risk,
    exception,
    dueAt,
  };
});
