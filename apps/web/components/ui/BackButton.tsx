'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

type BackButtonProps = {
  onClick?: () => void; // ถ้าอยาก override behavior
  className?: string;   // ถ้าอยากเพิ่ม style
};

export default function BackButton({ onClick, className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      router.back(); // ใช้ฟังก์ชัน back ของ Next.js
    }
  };

  return (
    <button
      type="button"
      aria-label="Back"
      onClick={handleBack}
      className={`grid mb-2 h-9 w-9 place-items-center rounded-md border border-slate-200 bg-slate-50 text-lg hover:bg-slate-100 ${className || ''}`}
    >
      ←
    </button>
  );
}
