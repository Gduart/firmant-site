import { getD1Database } from "@/lib/cloudflare-runtime";

export async function runStatement(query: string, values: unknown[] = []) {
  const database = await getD1Database();
  return database.prepare(query).bind(...values).run();
}

export async function firstStatement<T>(query: string, values: unknown[] = []) {
  const database = await getD1Database();
  return database.prepare(query).bind(...values).first<T>();
}

export async function allStatement<T>(query: string, values: unknown[] = []) {
  const database = await getD1Database();
  const result = await database.prepare(query).bind(...values).all<T>();
  return result.results;
}

export function nowIso() {
  return new Date().toISOString();
}
