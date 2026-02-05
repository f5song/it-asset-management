"use client";
import BackButton from "components/ui/BackButton";
import { FormPage } from "components/ui/FormPage";
import React from "react";
import { FormField } from "types/forms";
import { z } from "zod";


const schema = z.object({
  softwareName: z.string().min(1, "กรุณากรอกชื่อซอฟต์แวร์"),
  version: z.string().min(1, "กรุณาระบุเวอร์ชัน"),
  manufacturer: z.string().min(1, "กรุณาเลือกผู้ผลิต"),
  category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  policy: z.string().min(1, "กรุณาเลือกนโยบาย"),
  notes: z.string().optional(),
});

type SoftwareFormValues = z.infer<typeof schema>;

const defaultValues: SoftwareFormValues = {
  softwareName: "",
  version: "",
  manufacturer: "",
  category: "",
  policy: "",
  notes: "",
};

const fields: FormField<keyof SoftwareFormValues & string>[] = [
  {
    name: "softwareName",
    label: "Software Name",
    placeholder: "Google Chrome",
    type: "text",
    required: true,
    colSpan: 1,
  },
  {
    name: "notes",
    label: "Notes",
    placeholder: "รายละเอียดเพิ่มเติม เช่น ใช้สำหรับทีมการตลาด",
    type: "textarea",
    colSpan: 1,
  },
  {
    name: "version",
    label: "Version",
    placeholder: "v120",
    type: "text",
    required: true,
    colSpan: 1,
  },
  {
    name: "manufacturer",
    label: "Manufacturer",
    type: "select",
    required: true,
    colSpan: 1,
    options: [
      { label: "Google", value: "google" },
      { label: "Microsoft", value: "microsoft" },
      { label: "Adobe", value: "adobe" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    colSpan: 1,
    options: [
      { label: "Browser", value: "browser" },
      { label: "Design", value: "design" },
      { label: "Office", value: "office" },
      { label: "Security", value: "security" },
    ],
  },
  {
    name: "policy",
    label: "Policy",
    type: "select",
    required: true,
    colSpan: 1,
    options: [
      { label: "Allowed", value: "allowed" },
      { label: "Restricted", value: "restricted" },
      { label: "Blocked", value: "blocked" },
    ],
  },
];

export default function AddSoftwarePage() {
  return (
    <div>
      <BackButton/>
      <FormPage<SoftwareFormValues>
        title="Add Software"
        breadcrumbs={[
          { label: "Software Inventory", href: "/software/inventory" },
          { label: "Add Software" },
        ]}
        sectionTitle="Software Information"
        schema={schema}
        defaultValues={defaultValues}
        fields={fields}
        submitLabel="Add Request"
        cancelLabel="Cancel"
        onSubmit={async (data) => {
          // TODO: เรียก API
          console.log("submit:", data);
          alert("Software request submitted");
        }}
        onCancel={() => {
          // TODO: navigate กลับ
          alert("Canceled");
        }}
      />
    </div>
  );
}
