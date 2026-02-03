// apps/api/src/index.ts
import express, { Request, Response } from 'express';
import { Pool } from 'pg';

const app = express();
const port = Number(process.env.PORT ?? 8000);

const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'postgres',
  port: Number(process.env.DB_PORT ?? 5432),
});

app.get('/', (_req: Request, res: Response) => {
  res.send('API is running');
});

app.get('/health', async (_req: Request, res: Response) => {
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ ok: r.rows?.[0]?.ok === 1 });
  } catch (err) {
    // ถ้าคุณไม่ได้ตั้ง useUnknownInCatchVariables=false
    // ให้ cast แทน: const message = (err as Error).message;
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
