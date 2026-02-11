export function parsePaging(q: any) {
  const pageIndex = Math.max(0, Number(q.pageIndex ?? 0));
  const pageSize = Math.min(200, Math.max(1, Number(q.pageSize ?? 10)));
  const offset = pageIndex * pageSize;
  return { pageIndex, pageSize, offset, limit: pageSize };
}

export function parseSort(q: any, allow: string[], defaultSort = 'exception_id:desc') {
  const raw: string = q.sort ?? defaultSort;
  const [id, dir] = String(raw).split(':');
  const col = allow.includes(id) ? id : defaultSort.split(':')[0];
  const desc = String(dir).toLowerCase() === 'desc';
  return { col, desc };
}