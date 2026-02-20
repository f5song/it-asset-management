// apps/web/components/exceptions/AssignExceptionPage.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EmployeeItem } from "@/types";
import { searchEmployees } from "@/services/employees.service";
import { assignException } from "@/services/exceptions.service";
import { fullName } from "@/lib/name";

type Props = {
  exceptionId: string;
};

const AssignFormSchema = z.object({
  employeeIds: z.array(z.string()).min(1, "กรุณาเลือกพนักงานอย่างน้อย 1 คน"),
  effectiveDate: z.string().optional(),    // YYYY-MM-DD
  expiresAt: z.string().optional(),        // YYYY-MM-DD
});
type AssignFormValues = z.infer<typeof AssignFormSchema>;

const { handleSubmit, setValue, formState, register, watch } = useForm<AssignFormValues>({
  defaultValues: {
    employeeIds: [],
    effectiveDate: new Date().toISOString().slice(0, 10), // default วันนี้
    expiresAt: undefined,
  },
  mode: "onChange",
});

export default function AssignExceptionPage({ exceptionId }: Props) {
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<EmployeeItem[]>([]);
  const [selected, setSelected] = React.useState<EmployeeItem[]>([]);

  const { handleSubmit, setValue, formState } = useForm<AssignFormValues>({
    defaultValues: { employeeIds: [] },
    mode: "onChange",
  });

  // ค้นหาพนักงาน (debounce)
  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      try {
        setIsSearching(true);
        const data = await searchEmployees(query);
        if (!cancelled) setResults(data);
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };

    const t = setTimeout(run, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  // เพิ่ม/ลบ selection
  const addEmployee = (emp: EmployeeItem) => {
    if (selected.some((e) => e.id === emp.id)) return;
    const next = [...selected, emp];
    setSelected(next);
    setValue("employeeIds", next.map((e) => e.id), { shouldValidate: true });
  };

  const removeEmployee = (empId: string) => {
    const next = selected.filter((e) => e.id !== empId);
    setSelected(next);
    setValue("employeeIds", next.map((e) => e.id), { shouldValidate: true });
  };

  // ยืนยัน Assign

const onSubmit = async (values: AssignFormValues) => {
  try {
    await assignException({
      definitionId: exceptionId,         // <— id ของข้อยกเว้น
      employeeIds: values.employeeIds,   // <— พนักงานที่เลือก
      effectiveDate: values.effectiveDate,
      expiresAt: values.expiresAt,
    });

    alert(`Assign สำเร็จให้ ${values.employeeIds.length} คน`);
    router.push(`/exceptions/${exceptionId}`);
    router.refresh();
  } catch (e) {
    console.error(e);
    alert(`Assign ล้มเหลว: ${(e as Error).message}`);
  }
};


  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Assign Exception</h1>
        <p className="text-sm text-gray-500">
          เลือกพนักงานที่ต้องการ Assign exception นี้ (เลือกได้หลายคน)
        </p>
      </div>

      {/* Search + Results */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">ค้นหาพนักงาน</label>
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2"
          placeholder="พิมพ์ชื่อ/อีเมล/รหัสพนักงาน..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isSearching ? (
          <div className="text-sm text-gray-500">กำลังค้นหา...</div>
        ) : results.length > 0 ? (
          <ul className="divide-y border rounded-md">
            {results.map((emp) => (
              <li key={emp.id} className="flex items-center justify-between px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{fullName(emp)}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {emp.email ?? "-"} {emp.department ? `• ${emp.department}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => addEmployee(emp)}
                  disabled={selected.some((e) => e.id === emp.id)}
                >
                  {selected.some((e) => e.id === emp.id) ? "เลือกแล้ว" : "เพิ่ม"}
                </button>
              </li>
            ))}
          </ul>
        ) : query ? (
          <div className="text-sm text-gray-500">ไม่พบผลลัพธ์</div>
        ) : null}
      </div>

      {/* Selected */}
      <div className="space-y-2">
        <div className="text-sm font-medium">พนักงานที่เลือก</div>
        {selected.length === 0 ? (
          <div className="text-sm text-gray-500">ยังไม่ได้เลือกพนักงาน</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((emp) => (
              <span
                key={emp.id}
                className="inline-flex items-center gap-2 border rounded-full pl-3 pr-2 py-1 text-sm"
              >
                <span className="truncate max-w-[200px]">
                  {fullName(emp)} {emp.email ? `(${emp.email})` : ""}
                </span>
                <button
                  type="button"
                  className="rounded-full w-6 h-6 text-white bg-gray-400 hover:bg-gray-500"
                  onClick={() => removeEmployee(emp.id)}
                  aria-label="remove"
                  title="เอาออก"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <form onSubmit={handleSubmit(onSubmit)} className="pt-2">
        {formState.errors.employeeIds && (
          <div className="text-sm text-red-600 mb-2">
            {formState.errors.employeeIds.message}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            disabled={formState.isSubmitting || selected.length === 0}
          >
            {formState.isSubmitting ? "กำลัง Assign..." : "Assign"}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded border hover:bg-gray-50"
            onClick={() => router.push(`/exceptions/${exceptionId}`)}
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
