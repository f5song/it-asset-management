import AssignFormCore from "@/components/assign/AssignFormCore";
import { getAllDevices } from "@/services/devices.service.mock";
import { getAllEmployees } from "@/services/employees.service.mock";
import { getLicenseById } from "@/services/licenses.service.mock";


export default async function Page({ params }: { params: { id: string } }) {
  console.log("[assign employees] params.id =", params.id);
  const license = await getLicenseById(params.id);
  if (!license) return console.log("errorsdjflkjsdf");

  const [employees, devices] = await Promise.all([getAllEmployees(), getAllDevices()]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-3">Assign License → Employee</h1>
      <AssignFormCore
        mode="licenseToEmployee"
        license={license}
        employees={employees}
        devices={devices}
        licenses={[]}
      />
    </div>
  );
}
``