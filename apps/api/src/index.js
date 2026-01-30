import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 8000;

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "it_software_mgmt",
});

app.get("/", (req, res) => {
  res.send("Hello from Backend (Node.js)!");
});

app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1 as ok;");
    res.json({ db: "ok", result: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ db: "error", message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://0.0.0.0:${port}`);
});
