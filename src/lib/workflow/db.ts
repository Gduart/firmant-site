import { getD1Database } from "@/lib/cloudflare-runtime";

export type SqlValue = string | number | null;

export async function workflowRun(query: string, values: SqlValue[] = []) {
  const database = await getD1Database();
  return database.prepare(query).bind(...values).run();
}

export async function workflowFirst<T>(query: string, values: SqlValue[] = []) {
  const database = await getD1Database();
  return database.prepare(query).bind(...values).first<T>();
}

export async function workflowAll<T>(query: string, values: SqlValue[] = []) {
  const database = await getD1Database();
  const result = await database.prepare(query).bind(...values).all<T>();
  return result.results;
}

export function workflowNow() {
  return new Date().toISOString();
}

export function addDaysIso(value: Date | string, days: number) {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
