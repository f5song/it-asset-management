
// app/employees/[id]/page.tsx
import BackButton from "components/ui/BackButton";
import { notFound } from "next/navigation";
import { getEmployeeById } from "services/employees.service.mock";
import EmployeeDetail from "./EmployeeDetail";

type PageProps = { params: { id: string } };

export default async function EmployeeDetailPage({ params }: PageProps) {

  const { id } = await params;

  const employee = await getEmployeeById(id);
  if (!employee) return notFound();

  const breadcrumbs = [
    { label: "Employees", href: "/employees" },
    { label: employee.name ?? `Employee ${employee.id}`, href: `/employees/${employee.id}` },
  ];

  return (
    <div className="p-2">
      <BackButton />
      <EmployeeDetail
        item={employee}
        history={[]} 
        breadcrumbs={breadcrumbs}  // ถ้ามีประวัติจริง ให้เปลี่ยนเป็นค่าจาก service เช่น getHistoryByEmployee(id)
      />
    </div>
  );
}
