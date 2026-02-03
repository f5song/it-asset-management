// src/types/forms.ts
import type { BreadcrumbItem } from "./common";

export type ColSpan = 1 | 2;

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "checkbox"
  | "date"
  | "datetime"
  | "email"
  | "url";

export type BaseField<TName extends string = string> = {
  name: TName;
  label: string;
  required?: boolean;
  description?: string;
  colSpan?: ColSpan;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
};

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

export type FormField<TName extends string = string> =
  | TextField<TName>
  | TextareaField<TName>
  | NumberField<TName>
  | DateField<TName>
  | DateTimeField<TName>
  | CheckboxField<TName>
  | SelectField<TName>;

/** UI shell ของหน้าฟอร์ม (ไม่ผูกกับ Zod/RHF) */
export type FormShellProps<
  TInput extends Record<string, any>,
  TOutput = TInput
> = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  sectionTitle?: string;
  fields: ReadonlyArray<FormField<keyof TInput & string>>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};