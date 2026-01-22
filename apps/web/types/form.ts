
import { z } from "zod";

export type OptionItem = { label: string; value: string };

type ColSpan = 1 | 2;

type BaseField<T extends string> = {
  name: T;
  label: string;
  required?: boolean;
  description?: string;
  colSpan?: ColSpan;
};

export type TextField<T extends string> = BaseField<T> & {
  type: "text";
  placeholder?: string;
};

export type TextareaField<T extends string> = BaseField<T> & {
  type: "textarea";
  placeholder?: string;
};

export type NumberField<T extends string> = BaseField<T> & {
  type: "number";
  placeholder?: string;
};

export type DateField<T extends string> = BaseField<T> & {
  type: "date";
};

export type SelectField<T extends string> = BaseField<T> & {
  type: "select";
  options: OptionItem[];
  placeholder?: string;
};

export type FieldDescriptor<T extends string> =
  | TextField<T>
  | TextareaField<T>
  | NumberField<T>
  | DateField<T>
  | SelectField<T>;

export type BreadcrumbItem = { label: string; href?: string };

export type FormPageProps<TValues> = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  sectionTitle?: string;
  schema?: z.ZodType<TValues> | z.ZodTypeAny;
  defaultValues: TValues;
  fields: ReadonlyArray<FieldDescriptor<keyof TValues & string>>; // ✅ readonly
  onSubmit: (data: TValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};
