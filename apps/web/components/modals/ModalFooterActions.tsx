
'use client';

import * as React from 'react';
import { PrimaryButton, SecondaryButton } from './ModalButtons';
import { cn } from "@/lib/cn";

export type ModalFooterActionsProps = {
  onCancel: () => void;
  onSubmit?: () => void;       // ใช้กรณีไม่ได้อยู่ใน <form> หรือไม่อยากใช้ type="submit"
  submitting?: boolean;
  cancelLabel?: string;
  submitLabel?: string;
  /** ให้ footer ติดล่าง (sticky) ในโมดอล (default: true) */
  sticky?: boolean;
  /** จัดปุ่มชิดขวา/ซ้าย/กลาง */
  align?: 'end' | 'between' | 'center' | 'start';
  /** ส่งคลาสเพิ่มสำหรับ wrapper */
  className?: string;
  /** ปิดการใช้งานปุ่ม */
  disabled?: boolean;
  /** ถ้าอยู่ใน <form> และอยากใช้ submit แบบฟอร์ม */
  submitAsForm?: boolean;
};

export function ModalFooterActions({
  onCancel,
  onSubmit,
  submitting = false,
  cancelLabel = 'Cancel',
  submitLabel = 'Save changes',
  sticky = true,
  align = 'end',
  className,
  disabled = false,
  submitAsForm = true,
}: ModalFooterActionsProps) {
  const justify =
    align === 'between'
      ? 'sm:justify-between'
      : align === 'center'
      ? 'sm:justify-center'
      : align === 'start'
      ? 'sm:justify-start'
      : 'sm:justify-end';

  return (
    <div className={cn(sticky && 'sticky bottom-0 mt-6 bg-white', className)}>
      <div className="border-t border-slate-200 px-5 py-3">
        <div className={cn('flex flex-col-reverse gap-2 sm:flex-row', justify)}>
          <SecondaryButton onClick={onCancel} disabled={submitting || disabled}>
            {cancelLabel}
          </SecondaryButton>

          <PrimaryButton
            type={submitAsForm ? 'submit' as const : 'button' as const}
            onClick={!submitAsForm ? onSubmit : undefined}
            loading={submitting}
            disabled={disabled}
          >
            {submitLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
