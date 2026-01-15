
// columns/licenseColumns.ts
import type { ColumnDef } from '@tanstack/react-table';
import { LicenseItem } from '../types';


export const licenseColumns: ColumnDef<LicenseItem>[] = [
  { accessorKey: 'softwareName', header: 'ชื่อซอฟต์แวร์' },
  { accessorKey: 'vendor', header: 'ผู้ขาย/ผู้ผลิต' },
  { accessorKey: 'total', header: 'ทั้งหมด' },
  { accessorKey: 'inUse', header: 'ใช้งานอยู่' },
  { accessorKey: 'available', header: 'คงเหลือ' },
];
