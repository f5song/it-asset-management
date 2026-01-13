
'use client';

import { useEffect, useRef, useState } from 'react';
import { EditField } from '../../types/modal';

export type EditModalProps<TValues extends Record<string, any>> = {
  title: string;
  open: boolean;
  fields: EditField[];
  initialValues: TValues;
  onSubmit: (values: TValues) => void | Promise<void>;
  onClose: () => void;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  closeOnBackdrop?: boolean;
};

export function EditModal<TValues extends Record<string, any>>({
  title,
  open,
  fields,
  initialValues,
  onSubmit,
  onClose,
  submitting = false,
  submitLabel = 'Confirm',
  cancelLabel = 'Cancel',
  closeOnBackdrop = true,
}: EditModalProps<TValues>) {
  const [values, setValues] = useState<TValues>(initialValues);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef =
    useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

  // รีเซ็ตค่าเมื่อเปิดด้วยค่าใหม่
  useEffect(() => {
    if (open) setValues(initialValues);
  }, [open, initialValues]);

  // โฟกัสฟิลด์แรกเมื่อเปิด
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open]);


  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return;
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const setFieldValue = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const renderField = (field: EditField, index: number) => {
    const commonProps = {
      id: `field-${field.name}`,
      name: field.name,
      placeholder: field.placeholder,
      'aria-invalid': !!field.error,
      'aria-describedby': field.helpText ? `help-${field.name}` : undefined,
      disabled: field.disabled,
      required: field.required,
      className:
        'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none',
      ref: index === 0 ? (firstInputRef as any) : undefined,
    };

    const value = values[field.name];

    switch (field.type ?? 'text') {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            value={value ?? ''}
            onChange={(e) => setFieldValue(field.name, e.target.value)}
          />
        );
      case 'select':
        return (
          <select
            {...commonProps}
            value={value ?? ''}
            onChange={(e) => setFieldValue(field.name, e.target.value)}
          >
            <option value="" disabled>
              {field.placeholder ?? 'Select…'}
            </option>
            {(field.options ?? []).map((opt) => (
              <option key={`${field.name}-${opt.value}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            value={value ?? ''}
            onChange={(e) =>
              setFieldValue(
                field.name,
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
          />
        );
      case 'checkbox':
        return (
          <input
            {...commonProps}
            type="checkbox"
            checked={!!value}
            onChange={(e) => setFieldValue(field.name, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
        );
      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            value={value ?? ''}
            onChange={(e) => setFieldValue(field.name, e.target.value)}
          />
        );
      case 'email':
        return (
          <input
            {...commonProps}
            type="email"
            value={value ?? ''}
            onChange={(e) => setFieldValue(field.name, e.target.value)}
          />
        );
      case 'url':
        return (
          <input
            {...commonProps}
            type="url"
            value={value ?? ''}
            onChange={(e) => setFieldValue(field.name, e.target.value)}
          />
        );
      default:
        return (
          <input
            {...commonProps}
            type="text"
            value={value ?? ''}
            onChange={(e) => setFieldValue(field.name, e.target.value)}
          />
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-xl rounded-lg bg-white shadow-xl"
        style={{ maxHeight: 'calc(100vh - 2rem)' }} // จำกัดความสูง = viewport - padding overlay
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header: sticky */}
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
            <h3 id="modal-title" className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="ml-auto grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          {/* Body: scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4">
            {/* ถ้าต้องการ layout 2 คอลัมน์แบบในรูป ให้ใช้ grid ที่ breakpoint md */}
            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {fields.map((field, idx) => (
                <div key={field.name} className="flex flex-col gap-1">
                  <label
                    htmlFor={`field-${field.name}`}
                    className="text-sm font-medium text-slate-700"
                  >
                    {field.label}{' '}
                    {field.required && <span className="text-red-600">*</span>}
                  </label>
                  {renderField(field, idx)}
                  {field.helpText && (
                    <p id={`help-${field.name}`} className="text-xs text-slate-500">
                      {field.helpText}
                    </p>
                  )}
                  {field.error && (
                    <p className="text-xs text-red-600">{field.error}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer: sticky */}
            <div className="sticky bottom-0 mt-6 bg-white">
              <div className="border-t border-slate-200 px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    disabled={submitting}
                  >
                    {submitting && (
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="white"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    )}
                    {submitLabel}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
