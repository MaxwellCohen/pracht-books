import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { serverEnv } from '@pracht/core/env/server';
import { drizzle } from 'drizzle-orm/neon-http';

type Sql = NeonQueryFunction<false, false>;
type Database = ReturnType<typeof drizzle>;

let sql: Sql | null = null;
let db: Database | null = null;

function connectionString() {
  return serverEnv.POSTGRES_URL;
}

export function getSql() {
  const url = connectionString();
  if (!url) return null;
  if (!sql) sql = neon(url);
  return sql;
}

export function getDb() {
  const client = getSql();
  if (!client) return null;
  if (!db) db = drizzle(client);
  return db;
}

export function requireSql() {
  const client = getSql();
  if (!client) throw new Error('POSTGRES_URL environment variable is not set');
  return client;
}

export function requireDb() {
  const database = getDb();
  if (!database) throw new Error('POSTGRES_URL environment variable is not set');
  return database;
}
