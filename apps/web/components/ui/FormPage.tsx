
// src/components/FormPage.tsx
import React from "react";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormPageProps } from "@/types";
import { SelectInput, TextArea, TextInput } from "./Field";
import { PageHeader } from "./PageHeader";
import { Card } from "./Card";
import { FormActions } from "./FormActions";
import { Container } from "lucide-react";

/**
 * NOTE:
 * - ใส่ constraint: <TValues extends FieldValues>
 * - เพื่อให้ useForm<TValues>() ถูกต้องตาม react-hook-form
 */
export function FormPage<TValues extends FieldValues>({
  title,
  breadcrumbs,
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
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const renderField = (field: typeof fields[number]) => {
    const id = String(field.name);
    const errorMsg = (errors as any)[field.name]?.message as string | undefined;
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
    <main className="mx-auto max-w-6xl px-6 py-6">
      <PageHeader title={title} breadcrumbs={breadcrumbs} />

      <Container title={sectionTitle}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
          {/* ฟอร์มแบบ 2 คอลัมน์ */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {fields.map(renderField)}
          </div>

          <FormActions
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            onCancel={onCancel}
          />

          {isSubmitting && (
            <p className="text-sm text-gray-500">Processing…</p>
          )}
        </form>
      </Container>
    </main>
  );
}
