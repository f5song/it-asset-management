
export const show = (v: unknown) =>
  v === undefined || v === null || v === "" ? "—" : String(v);
