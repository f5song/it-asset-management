
// lib/schemas.ts
import { z } from 'zod';

// สมมติ response เป็น { data: T[]; total: number }
export const PaginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    total: z.number().nonnegative(),
  });

// ตัวอย่าง SoftwareItem schema
export const SoftwareItemSchema = z.object({
  name: z.string(),
  version: z.string(),
});
export type SoftwareItem = z.infer<typeof SoftwareItemSchema>;
