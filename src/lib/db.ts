import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
});

export async function query<T = unknown>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  return pool.query<T>(text, params);
}
