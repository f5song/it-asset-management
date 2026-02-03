// FormPage.tsx
"use client";

import React from "react";
import {
  useForm,
  FieldValues,
  DefaultValues,
  SubmitHandler,
  FieldErrors,
  Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { SelectInput, TextArea, TextInput } from "./Field";
import { PageHeader } from "./PageHeader";
import { FormActions } from "./FormActions";
import { Container } from "./Container";

// ⬇️ ปรับ path ให้ตรงกับโปรเจกต์
import type { FormShellProps, FormField } from "@/types/forms";

/** ให้ชัดว่า FieldValues คือ object */
type AnyValues = Record<string, any>;

/** schema: ไม่ผูก generic ให้ TS ชน — รับได้ทั้งมี/ไม่มี transform */
type AnySchema = z.ZodTypeAny;

/** แปลง zodResolver ให้เป็น Resolver<TIn, any, TOut> (แปะ cast จุดเดียว) */

const makeResolver = <TIn extends FieldValues, TOut extends AnyValues>(
  schema?: AnySchema,
): Resolver<TIn, any, TOut> | undefined => {
  if (!schema) return undefined;
  const zr: any = zodResolver;                 // ← cast ที่ “ตัวฟังก์ชัน”
  return zr(schema) as Resolver<TIn, any, TOut>;
};

/** Props ของฟอร์ม (UI shell + RHF/Zod) */
export type FormPageProps<
  TIn extends AnyValues,
  TOut extends AnyValues = TIn,
> = FormShellProps<TIn, TOut> & {
  schema?: AnySchema; // ZodTypeAny เพื่อเลี่ยง generic ชน
  defaultValues?: DefaultValues<TIn>; // ค่าที่เข้าฟอร์ม
  onSubmit: SubmitHandler<TOut>; // ค่าหลัง schema transform
};

export function FormPage<TIn extends AnyValues, TOut extends AnyValues = TIn>({
  title,
  breadcrumbs = [],
  sectionTitle = "",
  schema,
  defaultValues,
  fields,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
}: FormPageProps<TIn, TOut>) {
  // ✅ RHF ใส่ generic 3 ตัว: <input, any, output>

  const methods = useForm<TIn, any, TOut>({
    defaultValues,
    resolver: makeResolver<TIn, TOut>(schema), // ✅ เรียกผ่าน helper
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  /** errors อิง input */
  const getErrorMessage = (name: string) => {
    const e = (errors as FieldErrors<TIn>)[name as keyof TIn];
    return (e as any)?.message as string | undefined;
  };

  const renderField = (field: FormField<keyof TIn & string>) => {
    const id = String(field.name);
    const errorMsg = getErrorMessage(id);
    const col = field.colSpan === 2 ? "md:col-span-2" : "md:col-span-1";

    switch (field.type) {
      case "text":
      case "email":
      case "url":
        return (
          <div className={col} key={id}>
            <TextInput
              id={id}
              type={field.type}
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
              options={field.options}
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
      case "number":
        return (
          <div className={col} key={id}>
            <TextInput
              id={id}
              type="number"
              label={field.label}
              required={!!field.required}
              placeholder={field.placeholder}
              description={field.description}
              {...register(field.name as any, {
                required: field.required,
                valueAsNumber: true, // RHF แปลงเป็น number ให้อัตโนมัติ
              })}
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
      case "date":
        return (
          <div className={col} key={id}>
            <TextInput
              id={id}
              type="date"
              label={field.label}
              required={!!field.required}
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
      default:
        return null;
    }
  };

  return (
    <main>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />
      <Container title={sectionTitle}>
        {/* onSubmit รับ TOut (หลัง schema transform) */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="grid gap-6"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {fields.map(renderField)}
          </div>
          <FormActions
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            onCancel={onCancel}
          />
          {isSubmitting && <p className="text-sm text-gray-500">Processing…</p>}
        </form>
      </Container>
    </main>
  );
}
