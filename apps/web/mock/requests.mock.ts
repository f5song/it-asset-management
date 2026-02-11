import { RequestItem, RequestRisk } from "@/types/exception";


export const FILTER_OPTIONS = {
  sites: ['HQ', 'Bangkok', 'Rayong', 'Remote'] as const,
  risks: ['Low', 'Medium', 'High'] as const,
  exceptions: ['None', 'Policy A', 'Policy B', 'Policy C'] as const,
};

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeTitle(i: number) {
  const apps = ['Microsoft Word', 'Outlook', 'Excel', 'Power BI', 'Teams', 'OneDrive'];
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
    department: pick(['IT', 'HR', 'Finance', 'Operations', 'Security']),
    site,
    risk,
    exception,
    dueAt,
  };
});
