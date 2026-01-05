
// components/tables/RecentLicenseActivityTable.tsx
"use client";
import React from "react";
<<<<<<< HEAD

// ประเภทของแอ็กชัน เพื่อกำหนดสี/ป้ายในอนาคตได้
export type LicenseAction =
  | "Assign"
  | "Deallocate"
  | "Request Approved"
  | "Request Rejected";

export type LicenseActivity = {
  date: string | Date;     // วันที่ (สามารถเป็น Date หรือ string)
  action: LicenseAction;   // การกระทำ
  software: string;        // ชื่อซอฟต์แวร์
  employee: string;        // ชื่อพนักงาน
};
=======
import { LicenseActivity } from "@/mock/types.js";

>>>>>>> 342b763 (update sidebar)

type Props = {
  title?: string;
  items: LicenseActivity[];
  className?: string;
};

// ฟอร์แมตวันที่แบบไทย: "10 Dec 68"
// หมายเหตุ: ตัวอย่างปีเป็น พ.ศ. (2568) -> แสดง "68"
function formatThaiShortDate(input: string | Date) {
  const d = typeof input === "string" ? new Date(input) : input;
  // ถ้า new Date() ไม่สำเร็จ ให้คืนค่าข้อความเดิม
  if (isNaN(d.getTime())) return String(input);

  const day = d.getDate().toString().padStart(2, "0");

  // เดือนย่อภาษาอังกฤษตามตัวอย่างรูป (ถ้าอยากใช้ภาษาไทย -> เปลี่ยน array ได้)
  const monthShort = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][d.getMonth()];

  // ปี พ.ศ. -> แสดงเลขท้ายสองหลัก
  const buddhistYear = d.getFullYear() + 543;
  const year2 = buddhistYear.toString().slice(-2);

  return `${day} ${monthShort} ${year2}`;
}

export const RecentLicenseActivityTable: React.FC<Props> = ({
  title = "Recent License Activity",
  items,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 ${className}`}
    >
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>

      {/* ตารางสำหรับจอ >= sm */}
      <div className="hidden sm:block">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-sm text-gray-500 dark:text-gray-400">
<<<<<<< HEAD
              <th className="text-left font-medium py-2 border-b border-gray-200">Date</th>
=======
              <th className="text-left font-medium py-2 border-b border-gray-200 w-[120px]">Date</th>
>>>>>>> 342b763 (update sidebar)
              <th className="text-left font-medium py-2 border-b border-gray-200">Action</th>
              <th className="text-left font-medium py-2 border-b border-gray-200">Software N.</th>
              <th className="text-left font-medium py-2 border-b border-gray-200">Employee</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={`${row.employee}-${row.software}-${idx}`} className="text-sm">
                <td className="py-3 border-b border-gray-200 text-gray-800 dark:text-white/90">
                  {formatThaiShortDate(row.date)}
                </td>
                <td className="py-3 border-b border-gray-200 text-gray-700 dark:text-gray-300">
                  {row.action}
                </td>
                <td className="py-3 border-b border-gray-200 text-gray-700 dark:text-gray-300">
                  {row.software}
                </td>
                <td className="py-3 border-b border-gray-200 text-gray-700 dark:text-gray-300">
                  {row.employee}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* รายการสำหรับจอเล็ก < sm (stacked) */}
      <div className="sm:hidden">
        <ul className="divide-y divide-gray-200">
          {items.map((row, idx) => (
            <li key={`${row.employee}-${row.software}-m-${idx}`} className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-800 dark:text-white/90 font-medium">
                  {formatThaiShortDate(row.date)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{row.action}</span>
              </div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                <div className="truncate">
                  <span className="text-gray-500 dark:text-gray-400">Software: </span>
                  {row.software}
                </div>
                <div className="truncate">
                  <span className="text-gray-500 dark:text-gray-400">Employee: </span>
                  {row.employee}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

