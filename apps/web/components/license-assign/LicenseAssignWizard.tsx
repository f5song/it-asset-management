
"use client";

import { computeRequiredSeats, normalizeLicenseModel } from "lib/license-assign";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import {  LicenseAssignFormValues } from "types/license";
import { StepConfirm } from "./steps/StepConfirm";
import { assignLicenseBulk } from "services/assign.service.mock";
import { StepSeatAllocation } from "./steps/StepSeatAllocation";
import { StepPolicyCheck } from "./steps/StepPolicyCheck";
import { fetchDeviceCountsByUserIds } from "services/devices.service.mock";
import { checkPolicyBulk } from "services/policy.service.mock";
import { getEmployees } from "services/employees.service.mock";
import { StepDeviceImpact } from "./steps/StepDeviceImpact";
import { StepSelectEmployees } from "./steps/StepSelectEmployees";
import { Employees } from "types/employees";
import { getLicenseById } from "services/licenses.service.mock";


type Props = {
  licenseId: string;
  onCancel: () => void;
  onSuccess?: () => void;
};

export const LicenseAssignWizard: React.FC<Props> = ({
  licenseId,
  onCancel,
  onSuccess,
}) => {
  const [busy, setBusy] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [license, setLicense] = React.useState<{
    productName: string;
    available: number;
    modelRaw: string;
    consumptionUnit: "perUser" | "perDevice" | "concurrent";
    term: "subscription" | "perpetual" | "unknown";
  }>({
    productName: "",
    available: 0,
    modelRaw: "",
    consumptionUnit: "perUser",
    term: "unknown",
  });

  const methods = useForm<LicenseAssignFormValues>({
    mode: "onBlur",
    defaultValues: {
      licenseId,
      employees: [],
      mapping: [],
      seatMode: "partial",
      installedOn: new Date().toISOString().slice(0, 10),
    },
  });

  const { getValues, setValue } = methods;

  // initial: load license
  React.useEffect(() => {
    (async () => {
      const data = await getLicenseById(licenseId);
      const { consumptionUnit, term } = normalizeLicenseModel(data?.licenseModel ?? "");
      setLicense({
        productName: data?.softwareName ?? "",
        available: data?.available ?? 0,
        modelRaw: data?.licenseModel ?? "",
        consumptionUnit,
        term,
      });
    })();
  }, [licenseId]);

  const steps = React.useMemo(() => {
    const arr = ["Select Employees"];
    if (license.consumptionUnit === "perDevice") arr.push("Device Impact");
    arr.push("Policy Check", "Seat Allocation", "Confirm");
    return arr;
  }, [license.consumptionUnit]);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  // Step 1: selected employees → prepare mapping
  const handleEmployeesSelected = async (emps: Employees[]) => {
    setValue("employees", emps);
    let mapping = emps.map(e => ({ employeeId: e.id }));

    if (license.consumptionUnit === "perDevice") {
      const counts = await fetchDeviceCountsByUserIds(emps.map(e => e.id));
      mapping = mapping.map(m => ({ ...m, deviceCount: counts[m.employeeId] ?? 0 }));
    }

    // policy
    const policy = await checkPolicyBulk(licenseId, emps.map(e => e.id));
    mapping = mapping.map(m => {
      const p = policy.find(x => x.employeeId === m.employeeId);
      return { ...m, decision: p?.decision ?? "Allowed", exception: false, reason: "" };
    });

    setValue("mapping", mapping);
    next();
  };

  const requiredSeats = React.useMemo(() => {
    return computeRequiredSeats(license.consumptionUnit, getValues().mapping);
  }, [license.consumptionUnit, getValues]);

  const submitAll = async () => {
    setBusy(true);
    try {
      const v = getValues();
      const payload = {
        licenseId: v.licenseId,
        installedOn: v.installedOn,
        seatMode: v.seatMode,
        requestId: crypto.randomUUID(),
        items: v.mapping.flatMap(m => {
          if (license.consumptionUnit === "perUser") {
            return [{ employeeId: m.employeeId, exception: m.exception ? { reason: m.reason || "" } : null }];
          }
          if (license.consumptionUnit === "perDevice") {
            const n = m.deviceCount ?? 0;
            return Array.from({ length: n }).map(() => ({
              employeeId: m.employeeId,
              exception: m.exception ? { reason: m.reason || "" } : null,
            }));
          }
          // concurrent → treat as per-user entitlement (server enforce runtime)
          return [{ employeeId: m.employeeId, exception: m.exception ? { reason: m.reason || "" } : null }];
        }),
      };

      const res = await assignLicenseBulk(payload);
      if (!res.ok) {
        alert("Assignment failed");
        return;
      }
      if (res.failed.length) {
        alert(`สำเร็จ: ${res.assigned}, ล้มเหลว: ${res.failed.length}`);
      }
      onSuccess?.();
    } catch (e) {
      console.error(e);
      alert("Unexpected error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Assign “{license.productName}”
          </h1>
          <p className="text-sm text-gray-600">
            Model: <b>{license.modelRaw || "—"}</b>
            {license.term !== "unknown" ? <> · Term: <b>{license.term}</b></> : null}
            <> · Available seats: <b>{license.available}</b></>
          </p>
        </header>

        {/* Step indicator */}
        <ol className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          {steps.map((t, i) => (
            <li
              key={t}
              className={[
                "rounded-full px-3 py-1 border",
                i === step
                  ? "bg-blue-600 text-white border-blue-600"
                  : i < step
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-white text-gray-600 border-gray-200",
              ].join(" ")}
            >
              {i + 1}. {t}
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          {/* Step 1 */}
          {step === 0 && (
            <StepSelectEmployees
              onSelected={handleEmployeesSelected}
              fetchEmployees={getEmployees}
            />
          )}

          {/* Step 2: perDevice only */}
          {license.consumptionUnit === "perDevice" && step === 1 && (
            <StepDeviceImpact />
          )}

          {/* Step 3: Policy */}
          {((license.consumptionUnit === "perDevice" && step === 2) ||
            (license.consumptionUnit !== "perDevice" && step === 1)) && (
            <StepPolicyCheck />
          )}

          {/* Step 4: Seats */}
          {((license.consumptionUnit === "perDevice" && step === 3) ||
            (license.consumptionUnit !== "perDevice" && step === 2)) && (
            <StepSeatAllocation available={license.available} required={requiredSeats} />
          )}

          {/* Step 5: Confirm */}
          {((license.consumptionUnit === "perDevice" && step === 4) ||
            (license.consumptionUnit !== "perDevice" && step === 3)) && (
            <StepConfirm required={requiredSeats} />
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            disabled={busy}
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(s => Math.max(s - 1, 0))}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={busy || step === 0}
            >
              Back
            </button>

            {((license.consumptionUnit === "perDevice" && step < 4) ||
              (license.consumptionUnit !== "perDevice" && step < 3)) ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={busy}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={submitAll}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={busy}
              >
                {busy ? "Processing…" : "Confirm"}
              </button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};
