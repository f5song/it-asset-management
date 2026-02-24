// src/app/requests/_client/RequestsView.tsx
"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { createRequestsService } from "@/services/requests.service";
import { ExportFormat, FilterValues, ToolbarAction } from "@/types";
import { RequestListResponse, RequestItem } from "@/types/exception";
import React from "react";
import { FilterBar } from "../ui/FilterBar";
import { DataTable } from "../table";
import { requestColumns } from "@/lib/tables/requestColumns";
import { SortingState } from "@tanstack/react-table";
import { InventoryActionToolbar } from "../toolbar/InventoryActionToolbar";

type TStatus = string; // Site
type TType = string;   // Risk

type Props = {
  statusOptions: readonly string[];
  typeOptions?: readonly string[];
  manufacturerOptions?: readonly string[];
  allStatusLabel: string;
  allTypeLabel?: string;
  allManufacturerLabel?: string;
};

export default function RequestsView(props: Props) {
  const hasType = (props.typeOptions?.length ?? 0) > 0;

  // service stable
  const serviceRef = React.useRef(createRequestsService({ impl: "mock" }));

  // ---- state ----
  const [filters, setFilters] = React.useState<FilterValues<TStatus, TType>>({
    status: undefined,
    type: undefined,
    manufacturer: undefined,
    search: "",
  });
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = React.useState<RequestListResponse>({
    items: [],
    total: 0,
  });

  // table states
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [loading, setLoading] = React.useState(false);

  // NOTE: DataTable ใช้ได้ทั้ง string | number
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set());

  //   แปลงเป็น string[] เฉพาะตอนส่งให้ InventoryActionToolbar (แก้ปัญหา type)
  const selectedIdStrings = React.useMemo(() => Array.from(selectedIds, String), [selectedIds]);

  // debounce เฉพาะ search
  const debouncedSearch = useDebounce(filters.search ?? "", 350);

  // query stable
  const query = React.useMemo(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      filters: {
        site: filters.status,
        risk: filters.type,
        exception: filters.manufacturer,
        search: debouncedSearch,
      },
    }),
    [
      pagination.pageIndex,
      pagination.pageSize,
      filters.status,
      filters.type,
      filters.manufacturer,
      debouncedSearch,
    ],
  );

  // fetch with cancellation
  const abortRef = React.useRef<AbortController | null>(null);
  const reqIdRef = React.useRef(0);

  const fetchList = React.useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const myId = ++reqIdRef.current;

    setLoading(true);
    try {
      const res = await serviceRef.current.list(query);
      if (controller.signal.aborted || myId !== reqIdRef.current) return;
      setData(res);
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error(e);
    } finally {
      if (myId === reqIdRef.current) setLoading(false);
    }
  }, [query]);

  React.useEffect(() => {
    fetchList();
    return () => abortRef.current?.abort();
  }, [fetchList]);

  // handlers
  const onFiltersChange = (next: FilterValues<TStatus, TType>) => {
    setFilters(next);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setSelectedIds(new Set()); // เคลียร์ selection เมื่อ filter เปลี่ยน
  };

  const onExport = async (fmt: ExportFormat) => {
    const blob = await serviceRef.current.export(fmt, {
      filters: {
        site: filters.status,
        risk: filters.type,
        exception: filters.manufacturer,
        search: filters.search,
      },
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `requests-${ts}.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onAction = (_: ToolbarAction) => {};
  const handleClearClick = () => {
    setFilters({ search: "" });
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setSelectedIds(new Set());
  };

  // labels/right-extra (memo เพื่อกัน re-render ไม่จำเป็น)
  const labels = React.useMemo(
    () => ({
      status: "Site",
      type: "Risk",
      manufacturer: "Exceptions",
      searchPlaceholder: "Search",
      allStatus: props.allStatusLabel,
      allType: hasType ? props.allTypeLabel : undefined,
      allManufacturer: props.allManufacturerLabel,
      clear: "Clear",
    }),
    [
      props.allStatusLabel,
      props.allTypeLabel,
      props.allManufacturerLabel,
      hasType,
    ],
  );

  const filterBarRightExtra = React.useMemo<React.ReactNode>(() => {
    return (
      <InventoryActionToolbar
        entity="licenses"
        selectedIds={selectedIdStrings}
        basePath="/software/license-management"
        enableDefaultMapping
        onAction={(act) => {
          if (act === "Add") {
            // ...
          }
          if (act === "Delete") {
            // ...
          }
        }}
      />
    );
  }, [selectedIdStrings]);

  return (
    <div className="space-y-4">
      <FilterBar<TStatus, TType>
        filters={filters}
        onFiltersChange={onFiltersChange}
        statusOptions={props.statusOptions as readonly string[] | undefined}
        typeOptions={hasType ? (props.typeOptions as readonly string[]) : undefined}
        manufacturerOptions={props.manufacturerOptions}
        onExport={onExport}
        onAction={onAction}
        labels={labels}
        rightExtra={filterBarRightExtra}
        onClearFilters={handleClearClick}
        statusSelected={undefined}
        onStatusSelectedChange={undefined}
        typeSelected={undefined}
        onTypeSelectedChange={undefined}
        manufacturerSelected={undefined}
        onManufacturerSelectedChange={undefined}
      />

      {/* DataTable แทน list */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <DataTable<RequestItem>
          // data
          columns={requestColumns}
          rows={data.items}
          totalRows={data.total}
          // table options
          variant="default"
          size="xs"
          maxBodyHeight={480}
          defaultColMinWidth={96}
          // sorting
          sorting={sorting}
          onSortingChange={setSorting}
          clientSideSort
          // selection (checkbox หน้า/แถว)
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          selectionScope="page"
          getRowId={(r) => r.id}
          // navigation (คลิกแถว)
          onRowClick={(row) => {
            console.log("open request id:", (row as any)?.id);
          }}
          // pagination
          pagination={pagination}
          onPaginationChange={setPagination}
          // states
          isLoading={loading}
          isError={false}
          errorMessage={undefined}
          // empty message
          emptyMessage="ไม่พบรายการที่ตรงกับเงื่อนไข"
        />
      </div>
    </div>
  );
}
