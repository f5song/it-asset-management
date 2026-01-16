
// src/components/modals/EditModal.tsx
'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EditField } from '../../types/modal';
import { ModalFooterActions } from './ModalFooterActions';

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

  /**
   * เพดานความสูงของโมดอล (เช่น '90vh', 'calc(100vh - 2rem)', 720)
   * ค่าเริ่มต้น: '90vh'
   */
  maxHeight?: string | number;

  /**
   * โหมดความสูง:
   * - 'adaptive' : วัดคอนเทนต์แล้วตัดสินใจเปิดสกรอลภายใน (DEFAULT)
   * - 'scroll'   : บังคับให้มีสกรอลภายในเสมอ
   * - 'fit'      : ไม่เปิดสกรอลภายใน (ปล่อย overlay เลื่อน)
   */
  heightMode?: 'adaptive' | 'scroll' | 'fit';

  /** ความโปร่งของฉากหลัง (10/20/30/40/50/60) → 20 = bg-black/20 */
  overlayOpacity?: 10 | 20 | 30 | 40 | 50 | 60;
};

export function EditModal<TValues extends Record<string, any>>({
  title,
  open,
  fields,
  initialValues,
  onSubmit,
  onClose,
  submitting = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  closeOnBackdrop = true,
  maxHeight = '90vh',
  heightMode = 'adaptive',
  overlayOpacity = 20,
}: EditModalProps<TValues>) {
  const [values, setValues] = useState<TValues>(initialValues);

  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // ต้องเปิดสกรอลภายในไหม (เฉพาะ adaptive)
  const [clamped, setClamped] = useState(false);

  // โฟกัสฟิลด์แรกเมื่อเปิด
  const firstInputRef =
    useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

  /* ---------------------- helpers ---------------------- */

  const getMaxHeightPx = (): number => {
    if (typeof maxHeight === 'number') return maxHeight;
    const mh = String(maxHeight).trim();

    // 1) 90vh
    const vhMatch = mh.match(/^(\d+(?:\.\d+)?)vh$/i);
    if (vhMatch) {
      const vh = parseFloat(vhMatch[1]);
      return (window.innerHeight * vh) / 100;
    }

    // 2) px
    const pxMatch = mh.match(/^(\d+(?:\.\d+)?)px$/i);
    if (pxMatch) {
      return parseFloat(pxMatch[1]);
    }

    // 3) calc(100vh - 2rem) (รองรับรูปแบบง่าย ๆ)
    const calcMatch = mh.match(/^calc\(\s*100vh\s*-\s*([0-9.]+)rem\s*\)$/i);
    if (calcMatch) {
      const rem = parseFloat(calcMatch[1]);
      const remPx = rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
      return window.innerHeight - remPx;
    }

    // default fall back → 90vh
    return (window.innerHeight * 90) / 100;
  };

  const measure = () => {
    if (!containerRef.current || !headerRef.current || !innerRef.current || !footerRef.current) {
      setClamped(false);
      return;
    }
    const headerH = headerRef.current.offsetHeight;
    const contentH = innerRef.current.scrollHeight;
    const footerH = footerRef.current.offsetHeight;

    const total = headerH + contentH + footerH;
    const maxPx = getMaxHeightPx();

    // ถ้าสูงเกินเพดาน → clamp + เปิดสกรอลภายใน
    setClamped(total > maxPx);
  };

  /* ---------------------- effects ---------------------- */

  // reset values เมื่อเปิด
  useEffect(() => {
    if (open) setValues(initialValues);
  }, [open, initialValues]);

  // focus ฟิลด์แรก
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstInputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // ล็อกสกรอล body
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ปิดด้วย ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // เตือน dev ถ้า field.name ซ้ำ
  useEffect(() => {
    if (!open) return;
    const names = fields.map((f) => f.name);
    const dup = names.filter((n, i) => names.indexOf(n) !== i);
    if (dup.length) {
      // eslint-disable-next-line no-console
      console.warn('[EditModal] Duplicate field.name:', Array.from(new Set(dup)));
    }
  }, [open, fields]);

  // วัดคอนเทนต์ → ตัดสินใจ clamp หรือไม่
  useLayoutEffect(() => {
    if (!open) return;

    if (heightMode === 'scroll') {
      setClamped(true);
      return;
    }
    if (heightMode === 'fit') {
      setClamped(false);
      return;
    }

    // adaptive
    measure();

    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => measure());
    if (innerRef.current) ro.observe(innerRef.current);

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [open, heightMode, fields.length]);

  if (!open) return null;

  /* ---------------------- handlers ---------------------- */

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return;
    if (e.target === overlayRef.current) onClose();
  };

  const setFieldValue = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
  };

  /* ---------------------- UI helpers ---------------------- */

  const inputClass =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 ' +
    'placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ' +
    'disabled:opacity-60';

  const gridClass = 'space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0';

  const renderField = (field: EditField, index: number) => {
    const commonProps: any = {
      id: `field-${field.name}`,
      name: field.name,
      placeholder: field.placeholder,
      'aria-invalid': !!field.error,
      'aria-describedby': field.helpText ? `help-${field.name}` : undefined,
      disabled: field.disabled,
      required: field.required,
      className: inputClass,
      ref: index === 0 ? (firstInputRef as any) : undefined,
    };

    const value = (values as any)[field.name];

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
            className={inputClass + ' appearance-none'}
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
              setFieldValue(field.name, e.target.value === '' ? '' : Number(e.target.value))
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

  // สไตล์ของ container:
  // - ถ้า clamped → ให้ "height: maxHeight" (มีความสูงแน่นอนเพื่อให้ flex แจกพื้นที่/สกรอลได้)
  // - ถ้าไม่ clamped → ให้ "height: auto" (สูงตามคอนเทนต์)
  const containerStyle: React.CSSProperties = {
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight),
    height:
      heightMode === 'scroll' ? (typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight)) :
      heightMode === 'fit' ? 'auto' :
      clamped
        ? (typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight))
        : 'auto',
  };

  const overlayClass = `fixed inset-0 z-[100] grid place-items-center bg-black/${overlayOpacity} p-4`;

  /* ---------------------- render ---------------------- */

  return (
    <div
      ref={overlayRef}
      className={overlayClass}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={e => {
        if (!closeOnBackdrop) return;
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={containerRef}
        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden isolate"
        style={containerStyle}
      >
        {/* flex ancestors ต้องมี min-h-0 */}
        <div className="flex h-full flex-col min-h-0">
          {/* Header */}
          <div ref={headerRef} className="z-10 flex items-center gap-2 border-b border-slate-200 bg-white px-5 py-4">
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

          {/* Form: flex-1 + min-h-0 */}
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
            {/* Scroll area: flex-1 + min-h-0; เปิด overflow เฉพาะตอน clamped/scroll mode */}
            <div
              ref={scrollBoxRef}
              className={'flex-1 min-h-0 px-5 py-5 ' + ((heightMode === 'scroll' || (heightMode === 'adaptive' && clamped)) ? 'overflow-y-auto' : 'overflow-visible')}
              style={{ maxHeight: 'inherit' }} // รับเพดานจาก container
            >
              <div ref={innerRef} className="pb-4">
                <div className={gridClass}>
                  {fields.map((field, idx) => (
                    <div key={`${field.name}-${idx}`} className="flex flex-col gap-1 min-w-0">
                      <label htmlFor={`field-${field.name}`} className="text-sm font-medium text-slate-700">
                        {field.label} {field.required && <span className="text-red-600">*</span>}
                      </label>
                      {renderField(field, idx)}
                      {field.helpText && (
                        <p id={`help-${field.name}`} className="text-xs text-slate-500">
                          {field.helpText}
                        </p>
                      )}
                      {field.error && <p className="text-xs text-red-600">{field.error}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer: อยู่นอกพื้นที่สกรอล → ติดล่างเสมอ */}
            <div ref={footerRef} className="shrink-0">
              <ModalFooterActions
                onCancel={onClose}
                submitting={submitting}
                cancelLabel={cancelLabel}
                submitLabel={submitLabel}
                sticky={false}
                align="end"
                submitAsForm
                className="bg-white"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
