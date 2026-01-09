
// src/types/form.ts
import { z } from "zod";

export type OptionItem = { label: string; value: string };

export type FieldDescriptor<TFieldNames extends string> = {
  name: TFieldNames;
  label: string;
  placeholder?: string;
  type: "text" | "select" | "textarea";
  required?: boolean;
  options?: OptionItem[];          // สำหรับ select
  colSpan?: 1 | 2;                 // กว้าง 1 หรือ 2 คอลัมน์ ใน grid 2-cols
  description?: string;
};

export type BreadcrumbItem = { label: string; href?: string };

/**
 * schema: ใช้ z.ZodTypeAny หรือ z.ZodType<TValues>
 * - z.ZodTypeAny: ยืดหยุ่น รับ schema ใด ๆ
 * - z.ZodType<TValues>: เข้มงวด ผูกชนิดกับค่าฟอร์ม
 */
export type FormPageProps<TValues> = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  sectionTitle?: string;
  schema?: z.ZodType<TValues> | z.ZodTypeAny;
  defaultValues: TValues;
  fields: FieldDescriptor<keyof TValues & string>[];
  onSubmit: (data: TValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};
