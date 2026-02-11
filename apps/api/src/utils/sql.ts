export type Where = { sql: string; params: any[] };

export function whereBuilder() {
  const parts: string[] = [];
  const params: any[] = [];
  const add = (clause: string, value?: any) => {
    if (value === undefined || value === null || value === '') return;
    params.push(value);
    parts.push(clause.replace(/\$(\d+)/g, () => `$${params.length}`));
  };
  return {
    add,
    build: (): Where => ({
      sql: parts.length ? `WHERE ${parts.join(' AND ')}` : '',
      params
    })
  };
}