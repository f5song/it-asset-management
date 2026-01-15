
// columns/softwareColumns.ts
import type { ColumnDef } from '@tanstack/react-table';
import { SoftwareItem } from '../types';


export const softwareColumns: ColumnDef<SoftwareItem>[] = [
  { accessorKey: 'softwareName', header: 'ชื่อซอฟต์แวร์' },
  { accessorKey: 'manufacturer', header: 'ผู้ผลิต' },
  { accessorKey: 'version', header: 'เวอร์ชัน' },
  // ใส่คอลัมน์เพิ่มเติมตามต้องการ
];
