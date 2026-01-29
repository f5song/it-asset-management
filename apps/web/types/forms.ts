// src/types/forms.ts
import type { z } from "zod";
import type { BreadcrumbItem } from "./common";

/** Layout col span มาตรฐาน */
export type ColSpan = 1 | 2;

/** ประเภท field พื้นฐาน */
export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "checkbox"
  | "date"
  | "datetime"  // ✅ เพิ่มรองรับ datetime
  | "email"
  | "url";

/** โครง field พื้นฐาน */
export type BaseField<TName extends string = string> = {
  /** key สำหรับผูกค่ากับฟอร์ม */
  name: TName;
  /** ป้ายชื่อ */
  label: string;
  /** ต้องกรอกหรือไม่ */
  required?: boolean;
  /** คำอธิบายสั้นใต้ฟิลด์ */
  description?: string;
  /** ความกว้างคอลัมน์ */
  colSpan?: ColSpan;
  /** placeholder */
  placeholder?: string;
  /** ปิดการแก้ไข */
  disabled?: boolean;
  /** แสดงข้อความ error เฉพาะฟิลด์ */
  error?: string;
};

/** ฟิลด์ประเภทต่าง ๆ */
export type TextField<TName extends string = string> = BaseField<TName> & {
  type: "text" | "email" | "url";
};
export type TextareaField<TName extends string = string> = BaseField<TName> & {
  type: "textarea";
};
export type NumberField<TName extends string = string> = BaseField<TName> & {
  type: "number";
};
export type DateField<TName extends string = string> = BaseField<TName> & {
  type: "date";
};
/** ✅ ฟิลด์วันที่+เวลา (HTML input: datetime-local) */
export type DateTimeField<TName extends string = string> = BaseField<TName> & {
  type: "datetime";
};
export type CheckboxField<TName extends string = string> = BaseField<TName> & {
  type: "checkbox";
};
export type SelectField<TName extends string = string> = BaseField<TName> & {
  type: "select";
  options: { label: string; value: string | number }[];
};

/** Union ฟิลด์มาตรฐานเดียว */
export type FormField<TName extends string = string> =
  | TextField<TName>
  | TextareaField<TName>
  | NumberField<TName>
  | DateField<TName>
  | DateTimeField<TName>   // ✅ รวมเข้า union
  | CheckboxField<TName>
  | SelectField<TName>;

/** เพจฟอร์มมาตรฐาน */
export type FormPageProps<TValues> = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  sectionTitle?: string;
  schema?: z.ZodType<TValues> | z.ZodTypeAny;
  defaultValues: TValues;
  fields: ReadonlyArray<FormField<keyof TValues & string>>;
  onSubmit: (data: TValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};
