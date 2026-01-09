
import { z } from "zod";

// ตัวอย่าง schema ที่สอดคล้องกับ domain "software" ในโปรเจกต์ของคุณ
export const SoftwareSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  licenseKey: z.string().min(5),
  ownerDept: z.string().min(1),
  status: z.enum(["active", "inactive", "retired"]),
  installedAt: z.string().datetime().optional()
});

export type Software = z.infer<typeof SoftwareSchema>;

// ตัวอย่าง input สำหรับการ create
export const SoftwareCreateSchema = SoftwareSchema.omit({ id: true });
export type SoftwareCreateInput = z.infer<typeof SoftwareCreateSchema>;
