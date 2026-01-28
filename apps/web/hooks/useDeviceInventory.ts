"use client";

import { toUndefTrim } from "@/lib/filters";
import * as React from "react";
import { getDevices } from "services/devices.service.mock";
import type {
  DeviceDomainFilters,
  DeviceItem,
  DeviceListQuery,
} from "types/device";
import type { ServerQuery } from "types/server-query";

export function useDeviceInventory(
  serverQuery: ServerQuery,
  filters: DeviceDomainFilters = {},
) {
  const [rows, setRows] = React.useState<DeviceItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  const q: DeviceListQuery = React.useMemo(() => {
    const { pageIndex = 0, pageSize = 10, sortBy, sortOrder } = serverQuery;

    return {
      page: pageIndex + 1,
      pageSize,
      sortBy,
      sortOrder,
      search: filters.search ?? "",
      deviceGroup: toUndefTrim(
        filters.deviceGroup,
      ) as DeviceListQuery["deviceGroup"],
      deviceType: toUndefTrim(
        filters.deviceType,
      ) as DeviceListQuery["deviceType"],
      os: toUndefTrim(filters.os) as DeviceListQuery["os"],
    };
  }, [
    serverQuery.pageIndex,
    serverQuery.pageSize,
    serverQuery.sortBy,
    serverQuery.sortOrder,
    filters.search,
    filters.deviceGroup,
    filters.deviceType,
    filters.os,
  ]);

  React.useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res = await getDevices(q, ac.signal);

        if (!alive) return;
        // รองรับทั้งรูปแบบ totalCount หรือ total (กันไว้เผื่อ service ใช้ชื่อต่างกัน)
        setRows(Array.isArray(res.items) ? res.items : []);
        setTotalRows(
          Number.isFinite((res as any).totalCount)
            ? (res as any).totalCount
            : Number.isFinite((res as any).total)
              ? (res as any).total
              : 0,
        );
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (!alive) return;
        setError(true);
        setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, [q]); // ⬅️ effect จะรันเฉพาะเมื่อ query ที่ส่งเข้า service เปลี่ยนจริง ๆ

  return { rows, totalRows, isLoading, isError, errorMessage };
}
