
// src/components/datatable/DataTableStates.tsx
'use client';

import React from 'react';

export function LoadingBody({ colSpan, size = 'xs' }: { colSpan: number; size?: 'xs' | 'sm' | 'md' }) {
  const sizeClass = { xs: 'px-2 py-2 text-[12px]', sm: 'px-3 py-3 text-[13px]', md: 'px-3 py-3 text-[14px]' }[size];
  return (
    <tbody>
      <tr>
        <td className={sizeClass} colSpan={colSpan}>กำลังโหลด...</td>
      </tr>
    </tbody>
  );
}

export function ErrorBody({
  colSpan,
  message = 'เกิดข้อผิดพลาด',
  size = 'xs',
}: {
  colSpan: number;
  message?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  const sizeClass = { xs: 'px-2 py-2 text-[12px]', sm: 'px-3 py-3 text-[13px]', md: 'px-3 py-3 text-[14px]' }[size];
  return (
    <tbody>
      <tr>
        <td className={sizeClass + ' text-red-700'} colSpan={colSpan}>
          {message}
        </td>
      </tr>
    </tbody>
  );
}

export function EmptyBody({
  colSpan,
  message = 'ไม่มีข้อมูล',
  size = 'xs',
}: {
  colSpan: number;
  message?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  const sizeClass = { xs: 'px-2 py-2 text-[12px]', sm: 'px-3 py-3 text-[13px]', md: 'px-3 py-3 text-[14px]' }[size];
  return (
    <tbody>
      <tr>
        <td className={sizeClass + ' text-slate-500'} colSpan={colSpan}>
          {message}
        </td>
      </tr>
    </tbody>
  );
}
