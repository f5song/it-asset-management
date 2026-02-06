import AssignEmployeeToExceptionsClient from "@/components/assign/AssignEmployeeToExceptionsClient";
import { notFound } from "next/navigation";
import { getEmployeeById } from "@/services/employees.service.mock"; // ⚠️ ต้อง server-safe (ไม่มี 'use client')

export default async function ExceptionAssignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ ต้อง await ก่อน แล้วค่อยใช้
  const { id: idRaw } = await params;
  const id = decodeURIComponent(idRaw ?? "").trim();

  const employee = await getEmployeeById(id);
  if (!employee) return notFound();

  return <AssignEmployeeToExceptionsClient employee={employee} />;
}
