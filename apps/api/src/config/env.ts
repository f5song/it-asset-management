import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? '4000'),
  PGHOST: process.env.PGHOST!,
  PGPORT: Number(process.env.PGPORT ?? '5432'),
  PGDATABASE: process.env.PGDATABASE!,
  PGUSER: process.env.PGUSER!,
  PGPASSWORD: process.env.PGPASSWORD!
};

['PGHOST','PGDATABASE','PGUSER','PGPASSWORD'].forEach((k) => {
  if (!((env as any)[k])) throw new Error(`Missing env: ${k}`);
});