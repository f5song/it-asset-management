
// FormPage.tsx
'use client';

import React from "react";
import {
  useForm,
  FieldValues,
  DefaultValues,
  SubmitHandler,
  FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { SelectInput, TextArea, TextInput } from "./Field";
import { PageHeader } from "./PageHeader";
import { FormActions } from "./FormActions";
import { Container } from "./Container";

/** ... BaseField และ FormPageProps เดิม ... */
export type FormPageProps<TValues extends FieldValues> = {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  sectionTitle: string;

  /** ✅ เปลี่ยนเป็น ZodTypeAny */
  schema?: z.ZodTypeAny;

  /** ✅ defaultValues ต้องเป็น DefaultValues<TValues> */
  defaultValues?: DefaultValues<TValues>;

  fields: (
    | { type: "text"; name: keyof TValues & string; label: string; required?: boolean; placeholder?: string; description?: string; colSpan?: 1 | 2 }
    | { type: "textarea"; name: keyof TValues & string; label: string; required?: boolean; placeholder?: string; description?: string; colSpan?: 1 | 2 }
    | { type: "select"; name: keyof TValues & string; label: string; required?: boolean; description?: string; options?: { label: string; value: string }[]; colSpan?: 1 | 2 }
  )[];

  onSubmit: SubmitHandler<TValues>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};

export function FormPage<TValues extends FieldValues>({
  title,
  breadcrumbs = [],
  sectionTitle,
  schema,
  defaultValues,
  fields,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
}: FormPageProps<TValues>) {
  const methods = useForm<TValues>({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined, // ✅ ไม่ต้อง cast แปลก ๆ
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const getErrorMessage = (name: string) => {
    const e = (errors as FieldErrors<TValues>)[name as keyof TValues];
    return (e as any)?.message as string | undefined;
  };

  const renderField = (field: (typeof fields)[number]) => {
    const id = String(field.name);
    const errorMsg = getErrorMessage(field.name);
    const col = field.colSpan === 2 ? "md:col-span-2" : "md:col-span-1";

    switch (field.type) {
      case "text":
        return (
          <div className={col} key={id}>
            <TextInput
              id={id}
              label={field.label}
              required={!!field.required}
              placeholder={field.placeholder}
              description={field.description}
              {...register(field.name as any, { required: field.required })}
              aria-invalid={!!errorMsg}
              aria-errormessage={errorMsg ? `${id}-error` : undefined}
            />
            {errorMsg && (
              <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
                {errorMsg}
              </p>
            )}
          </div>
        );
      case "textarea":
        return (
          <div className={col} key={id}>
            <TextArea
              id={id}
              label={field.label}
              required={!!field.required}
              placeholder={field.placeholder}
              description={field.description}
              {...register(field.name as any, { required: field.required })}
              aria-invalid={!!errorMsg}
              aria-errormessage={errorMsg ? `${id}-error` : undefined}
            />
            {errorMsg && (
              <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
                {errorMsg}
              </p>
            )}
          </div>
        );
      case "select":
        return (
          <div className={col} key={id}>
            <SelectInput
              id={id}
              label={field.label}
              required={!!field.required}
              description={field.description}
              options={field.options ?? []}
              {...register(field.name as any, { required: field.required })}
              aria-invalid={!!errorMsg}
              aria-errormessage={errorMsg ? `${id}-error` : undefined}
              defaultValue=""
            />
            {errorMsg && (
              <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
                {errorMsg}
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />
      <Container title={sectionTitle}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {fields.map(renderField)}
          </div>
          <FormActions submitLabel={submitLabel} cancelLabel={cancelLabel} onCancel={onCancel} />
          {isSubmitting && <p className="text-sm text-gray-500">Processing…</p>}
        </form>
      </Container>
    </main>
  );
}
