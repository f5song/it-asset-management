"use client";

import React from "react";
import BackButton from "@/components/ui/BackButton";
import { FormPage } from "@/components/ui/FormPage";
import { FormField } from "@/types";
import { z } from "zod";

//   ใช้ type ที่มีอยู่แล้ว
import type {
  PolicyStatus,
  RiskLevel,
  ExceptionEditValues,
} from "@/types/exception";

// literal สำหรับ z.enum (สำคัญ: as const)
const POLICY_STATUS = ["Active", "Inactive"] as const;
const RISK_LEVEL   = ["Low", "Medium", "High"] as const;

const schema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อข้อยกเว้น"),
  status: z.enum(POLICY_STATUS, { message: "กรุณาเลือกสถานะ" }),
  risk:   z.enum(RISK_LEVEL,    { message: "กรุณาเลือกระดับความเสี่ยง" }),
  notes: z.string().optional(),
});

type ExceptionFormValues = z.infer<typeof schema>;

const defaultValues: ExceptionFormValues = {
  name: "",
  status: "Active",
  risk: "Medium",
  notes: "",
};

const fields: FormField<keyof ExceptionFormValues & string>[] = [
  {
    name: "name",
    label: "Exception Name",
    placeholder: "เช่น Allow LINE on PC / Allow USB storage",
    type: "text",
    required: true,
    colSpan: 1,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    colSpan: 1,
    options: POLICY_STATUS.map((s) => ({ label: s, value: s })),
  },
  {
    name: "risk",
    label: "Risk Level",
    type: "select",
    required: true,
    colSpan: 1,
    options: RISK_LEVEL.map((r) => ({ label: r, value: r })),
  },
  {
    name: "notes",
    label: "Notes",
    placeholder: "รายละเอียดเพิ่มเติม เช่น เงื่อนไขการอนุมัติ/ขอบเขตการใช้งาน",
    type: "textarea",
    colSpan: 2,
  },
];

export default function AddExceptionPage() {
  return (
    <div>
      <BackButton />
      <FormPage<ExceptionFormValues>
        title="Add Exception"
        breadcrumbs={[
          { label: "Exceptions", href: "/exceptions" },
          { label: "Add Exception" },
        ]}
        sectionTitle="Exception Information"
        schema={schema}
        defaultValues={defaultValues}
        fields={fields}
        submitLabel="Create Exception"
        cancelLabel="Cancel"
        onSubmit={async (data) => {
          const payload: ExceptionEditValues = {
            name: data.name.trim(),
            status: data.status as PolicyStatus,
            risk: data.risk as RiskLevel,
            createdAt: new Date().toISOString(),
            notes: data.notes?.trim() || undefined,
          };

          // TODO: เรียก service API ของคุณ เช่น:
          // await exceptionsService.createDefinition(payload);
          console.log("submit exception:", payload);
          alert("Exception created");
        }}
        onCancel={() => {
          // TODO: นำทางกลับหน้า Exceptions
          // const router = useRouter(); router.push('/exceptions')
          alert("Canceled");
        }}
      />
    </div>
  );
}