import AssignFormCore from "@/components/assign/AssignFormCore";
import { getAllLicenses } from "@/mock";
import { getAllDevices } from "@/services/devices.service.mock";
import { getEmployeeById } from "@/services/employees.service.mock";
import { notFound } from "next/navigation";


export default async function Page({ params }: { params: { id: string } }) {
  const employee = await getEmployeeById(params.id);
  if (!employee) return notFound();

  const [licenses, devices] = await Promise.all([getAllLicenses(), getAllDevices()]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-3">
        Assign Employee → License
      </h1>
      <AssignFormCore
        mode="employeeToLicense"
        employee={employee}
        employees={[]}  // ไม่ใช้ในโหมดนี้
        devices={devices}
        licenses={licenses}
      />
    </div>
  );
}