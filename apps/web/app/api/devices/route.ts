
import { NextResponse } from "next/server";

// mock data ใน memory
const MOCK_DEVICES = Array.from({ length: 57 }).map((_, i) => ({
  id: `D-${i + 1}`,
  name: `Device ${i + 1}`,
  type: i % 2 === 0 ? "Laptop" : "Desktop",
  assignedTo: i % 3 === 0 ? `User ${i}` : "",
  os: ["Windows", "macOS", "Linux"][i % 3],
  compliance: i % 2 === 0 ? "Compliant" : "Non-Compliant",
  lastScan: "2026-01-10",
}));

export async function GET(req: Request) {
  const url = new URL(req.url);

  // parameters
  const page = Number(url.searchParams.get("page") ?? 1);
  const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
  const sortBy = url.searchParams.get("sortBy") ?? "id";
  const sortOrder = url.searchParams.get("sortOrder") ?? "asc";
  const deviceGroup = url.searchParams.get("deviceGroup") ?? "";
  const deviceType = url.searchParams.get("deviceType") ?? "";
  const os = url.searchParams.get("os") ?? "";
  const search = url.searchParams.get("search") ?? "";

  let data = [...MOCK_DEVICES];

  // filter
  if (deviceType) data = data.filter(d => d.type === deviceType);
  if (os)         data = data.filter(d => d.os === os);
  if (search)     data = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  // sort
  data.sort((a: any, b: any) => {
    const A = a[sortBy];
    const B = b[sortBy];
    if (A < B) return sortOrder === "asc" ? -1 : 1;
    if (A > B) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // pagination
  const start = (page - 1) * pageSize;
  const items = data.slice(start, start + pageSize);

  return NextResponse.json({ items, total: data.length });
}
