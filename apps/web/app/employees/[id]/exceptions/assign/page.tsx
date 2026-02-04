import AssignEmployeeToExceptionsClient from "@/components/assign/AssignEmployeeToExceptionsClient";
import { getEmployeeById } from "@/services/employees.service.mock";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const employee = await getEmployeeById(params.id);
  if (!employee) return notFound();

  return <AssignEmployeeToExceptionsClient employee={employee} />;
}
