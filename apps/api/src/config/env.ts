import 'dotenv/config';

const pick = (a?: string, b?: string) => a ?? b;

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? '4000'),

  // รองรับทั้ง PG_* และ DB_* เพื่อความยืดหยุ่น
  PGHOST: pick(process.env.PGHOST, process.env.DB_HOST),
  PGPORT: Number(pick(process.env.PGPORT, process.env.DB_PORT) ?? '5432'),
  PGDATABASE: pick(process.env.PGDATABASE, process.env.DB_NAME),
  PGUSER: pick(process.env.PGUSER, process.env.DB_USER),
  PGPASSWORD: pick(process.env.PGPASSWORD, process.env.DB_PASSWORD),

  // รองรับ DATABASE_URL (สำหรับไลบรารีที่อ่าน connection string ได้)
  DATABASE_URL: process.env.DATABASE_URL,
};

// ถ้าไม่มี DATABASE_URL ให้บังคับว่าชุดค่าต้องครบ
if (!env.DATABASE_URL) {
  ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'].forEach((k) => {
    if (!(env as any)[k]) throw new Error(`Missing env: ${k}`);
  });
}