
export async function assignLicenseBulk(payload: {
  licenseId: string;
  installedOn: string;
  seatMode: "partial" | "all-or-nothing";
  requestId: string;
  items: { employeeId: string; exception: { reason: string } | null }[];
}): Promise<{ ok: boolean; assigned: number; failed: { employeeId: string; reason: string }[] }> {
  // เดโม: assign 90% success
  const failed = payload.items
    .filter(() => Math.random() < 0.1)
    .map(it => ({ employeeId: it.employeeId, reason: "random-failed" }));
  const assigned = payload.items.length - failed.length;
  console.log("assign bulk payload:", payload);
  return { ok: true, assigned, failed };
}
